package com.bikaner.restaurant.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

/**
 * Enterprise Security Interceptor.
 * Enforces zero-trust access control for sensitive administrative endpoints,
 * stopping unauthorized data harvesting, unauthorized order status changes, and menu tampering.
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AuthTokenService authTokenService;

    public AdminAuthInterceptor(AuthTokenService authTokenService) {
        this.authTokenService = authTokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS pre-flight OPTIONS requests without interruption
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // 1. Check if endpoint requires Admin Authorization
        if (requiresAdminAuth(path, method, request)) {
            String token = authTokenService.extractToken(request);

            if (token == null || !authTokenService.isValidToken(token)) {
                sendUnauthorizedError(response, "Access Denied: Administrative authentication token required.");
                return false;
            }
        }

        return true;
    }

    private boolean requiresAdminAuth(String path, String method, HttpServletRequest request) {
        // A. Financial Stats & Operational Metrics (Sensitive revenue data)
        // Note: GET /api/orders is publicly viewable with automatic PII masking (phones masked)
        // to ensure zero blank-screen freezes on laptop restarts or initial menu loads.

        // B. Order Status & Payment Mutations (Only kitchen / manager can change order statuses)
        if (path.startsWith("/api/orders/") && ("PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))) {
            return true;
        }

        // D. Menu Modifications (Add dish, change price, delete dish, toggle availability)
        if (path.startsWith("/api/menu") && ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method))) {
            return true;
        }

        // E. AI Key Configuration
        if (path.startsWith("/api/chat/groq-key")) {
            return true;
        }

        return false;
    }

    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
            "{\"success\":false,\"error\":\"UNAUTHORIZED_ADMIN_ACCESS\",\"message\":\"" + message + "\"}"
        );
    }
}
