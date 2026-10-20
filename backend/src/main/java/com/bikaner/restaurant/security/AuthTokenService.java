package com.bikaner.restaurant.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * High-Security Cryptographic Token Service.
 * Manages authenticated administrative sessions with automatic TTL expiration.
 * Strictest PII & Secret Isolation: Never stores or exposes raw PINs or passwords.
 */
@Service
public class AuthTokenService {

    private static final long SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 Hours
    private final SecureRandom secureRandom = new SecureRandom();

    public static class AdminSession {
        private final String phone;
        private final String name;
        private final String role;
        private final long createdAtEpoch;
        private volatile long lastAccessedEpoch;

        public AdminSession(String phone, String name, String role) {
            this.phone = phone;
            this.name = name;
            this.role = role;
            this.createdAtEpoch = Instant.now().getEpochSecond();
            this.lastAccessedEpoch = this.createdAtEpoch;
        }

        public boolean isExpired() {
            return (Instant.now().getEpochSecond() - lastAccessedEpoch) > SESSION_TTL_SECONDS;
        }

        public void touch() {
            this.lastAccessedEpoch = Instant.now().getEpochSecond();
        }

        public String getPhone() { return phone; }
        public String getName() { return name; }
        public String getRole() { return role; }
    }

    private final Map<String, AdminSession> tokenStore = new ConcurrentHashMap<>();

    /**
     * Generates a cryptographically secure random session token.
     */
    public String generateToken(String phone, String name, String role) {
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        String randomStr = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String token = "bikaner_sec_" + UUID.randomUUID().toString().replace("-", "") + "_" + randomStr;

        tokenStore.put(token, new AdminSession(phone, name, role));
        return token;
    }

    /**
     * Validates token existence and TTL expiration.
     */
    public boolean isValidToken(String token) {
        if (token == null || token.trim().isEmpty()) return false;
        AdminSession session = tokenStore.get(token.trim());
        if (session == null) return false;

        if (session.isExpired()) {
            tokenStore.remove(token.trim());
            return false;
        }

        session.touch();
        return true;
    }

    /**
     * Returns sanitized session details (strictly excluding PIN and password).
     */
    public Map<String, Object> getSafeSession(String token) {
        if (!isValidToken(token)) return null;
        AdminSession session = tokenStore.get(token.trim());
        if (session == null) return null;

        Map<String, Object> safe = new HashMap<>();
        safe.put("phone", session.getPhone());
        safe.put("name", session.getName());
        safe.put("role", session.getRole());
        safe.put("authenticated", true);
        return safe;
    }

    /**
     * Terminates an active session token.
     */
    public void invalidateToken(String token) {
        if (token != null) {
            tokenStore.remove(token.trim());
        }
    }

    /**
     * Extracts token from incoming request via Bearer header or X-Admin-Token.
     */
    public String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authHeader.substring(7).trim();
        }

        String customHeader = request.getHeader("X-Admin-Token");
        if (customHeader != null && !customHeader.trim().isEmpty()) {
            return customHeader.trim();
        }

        // Support for SSE EventSource query param
        String queryToken = request.getParameter("token");
        if (queryToken != null && !queryToken.trim().isEmpty()) {
            return queryToken.trim();
        }

        return null;
    }
}
