package com.bikaner.restaurant.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Enterprise Defense-in-Depth HTTP Security Headers Filter.
 * Mitigates Clickjacking, MIME-Sniffing, XSS, and unauthenticated client caching.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 1. Prevent MIME-type sniffing
        response.setHeader("X-Content-Type-Options", "nosniff");

        // 2. Prevent UI Redressing / Clickjacking
        response.setHeader("X-Frame-Options", "SAMEORIGIN");

        // 3. Cross-Site Scripting (XSS) Protection
        response.setHeader("X-XSS-Protection", "1; mode=block");

        // 4. Referrer Policy: Protect origin paths
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // 5. Restrict dangerous browser features
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

        // 6. Force HTTPS transport when hosted behind SSL/Cloudflare/Render
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

        // 7. Prevent caching of sensitive financial / authentication data
        String uri = request.getRequestURI();
        if (uri.startsWith("/api/auth") || uri.startsWith("/api/orders")) {
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, private");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }

        chain.doFilter(req, res);
    }
}
