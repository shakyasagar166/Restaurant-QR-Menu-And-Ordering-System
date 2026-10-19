package com.bikaner.restaurant.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    // Configured admin credentials as requested
    private static final String ADMIN_PHONE = "9058605348";
    private static final String ADMIN_PASSWORD = "shivamshakya098";
    private static final String ADMIN_NAME = "Shivam Shakya";

    // In-memory token store for ultra-fast session validation
    private static final Map<String, Map<String, Object>> activeTokens = new HashMap<>();

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String phone = credentials.get("phone");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();

        if (phone != null && password != null &&
            phone.trim().equals(ADMIN_PHONE) &&
            password.trim().equals(ADMIN_PASSWORD)) {

            String token = "bikaner_auth_" + UUID.randomUUID().toString();
            Map<String, Object> session = new HashMap<>();
            session.put("phone", ADMIN_PHONE);
            session.put("name", ADMIN_NAME);
            session.put("role", "ROLE_ADMIN");
            session.put("loginTime", System.currentTimeMillis());

            activeTokens.put(token, session);

            response.put("success", true);
            response.put("token", token);
            response.put("phone", ADMIN_PHONE);
            response.put("name", ADMIN_NAME);
            response.put("role", "ADMIN");
            response.put("message", "Welcome Shivam Shakya! Admin authentication successful.");

            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid credentials. Please enter correct Phone & Password.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifySession(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        Map<String, Object> response = new HashMap<>();

        if (token != null && activeTokens.containsKey(token)) {
            response.put("valid", true);
            response.put("user", activeTokens.get(token));
            return ResponseEntity.ok(response);
        }

        response.put("valid", false);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token != null) {
            activeTokens.remove(token);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
