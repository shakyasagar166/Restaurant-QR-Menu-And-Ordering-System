package com.bikaner.restaurant.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Enterprise Rate Limiter & Brute-Force Shield.
 * Protects against credential cracking, denial-of-service, and automated bot order flooding.
 */
@Service
public class RateLimiterService {

    // Login Brute-Force Limits: 5 failed attempts = 15 minute lockout
    private static final int MAX_FAILED_LOGINS = 5;
    private static final long LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

    // Order Flood Limits: 5 orders per minute per IP
    private static final int MAX_ORDERS_PER_MINUTE = 5;

    // Chat DDoS Limits: 15 queries per minute per IP
    private static final int MAX_CHATS_PER_MINUTE = 15;

    private static class LoginAttempt {
        AtomicInteger count = new AtomicInteger(0);
        long firstAttemptEpoch = Instant.now().getEpochSecond();
        long lockoutUntilEpoch = 0;
    }

    private static class RequestBucket {
        AtomicInteger count = new AtomicInteger(0);
        long windowStartEpoch = Instant.now().getEpochSecond();
    }

    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    private final Map<String, RequestBucket> orderBuckets = new ConcurrentHashMap<>();
    private final Map<String, RequestBucket> chatBuckets = new ConcurrentHashMap<>();

    /**
     * Checks if the given client IP is currently locked out from login attempts.
     */
    public boolean isLoginLocked(String ip) {
        LoginAttempt attempt = loginAttempts.get(ip);
        if (attempt == null) return false;

        long now = Instant.now().getEpochSecond();
        if (attempt.lockoutUntilEpoch > now) {
            return true;
        }

        // Lockout expired, reset if needed
        if (attempt.lockoutUntilEpoch > 0 && attempt.lockoutUntilEpoch <= now) {
            loginAttempts.remove(ip);
            return false;
        }

        return false;
    }

    public long getRemainingLockoutSeconds(String ip) {
        LoginAttempt attempt = loginAttempts.get(ip);
        if (attempt == null) return 0;
        long remaining = attempt.lockoutUntilEpoch - Instant.now().getEpochSecond();
        return Math.max(0, remaining);
    }

    /**
     * Records a failed login attempt for the given IP.
     * Returns true if the IP has just been locked out.
     */
    public boolean recordFailedLogin(String ip) {
        long now = Instant.now().getEpochSecond();
        LoginAttempt attempt = loginAttempts.computeIfAbsent(ip, k -> new LoginAttempt());

        // Reset if window older than 15 mins
        if (now - attempt.firstAttemptEpoch > LOCKOUT_DURATION_SECONDS && attempt.lockoutUntilEpoch <= now) {
            attempt.count.set(0);
            attempt.firstAttemptEpoch = now;
            attempt.lockoutUntilEpoch = 0;
        }

        int current = attempt.count.incrementAndGet();
        if (current >= MAX_FAILED_LOGINS) {
            attempt.lockoutUntilEpoch = now + LOCKOUT_DURATION_SECONDS;
            return true;
        }
        return false;
    }

    /**
     * Clears failed attempts upon successful authentication.
     */
    public void recordSuccessfulLogin(String ip) {
        loginAttempts.remove(ip);
    }

    /**
     * Rate limits order submissions to prevent automated order spam flooding.
     */
    public boolean allowOrderSubmission(String ip) {
        return checkBucket(orderBuckets, ip, MAX_ORDERS_PER_MINUTE, 60);
    }

    /**
     * Rate limits AI chat requests to prevent Groq API exhaustion / DDoS.
     */
    public boolean allowChatQuery(String ip) {
        return checkBucket(chatBuckets, ip, MAX_CHATS_PER_MINUTE, 60);
    }

    private boolean checkBucket(Map<String, RequestBucket> map, String ip, int maxRequests, int windowSeconds) {
        long now = Instant.now().getEpochSecond();
        RequestBucket bucket = map.computeIfAbsent(ip, k -> new RequestBucket());

        synchronized (bucket) {
            if (now - bucket.windowStartEpoch >= windowSeconds) {
                bucket.count.set(0);
                bucket.windowStartEpoch = now;
            }

            if (bucket.count.get() >= maxRequests) {
                return false;
            }

            bucket.count.incrementAndGet();
            return true;
        }
    }
}
