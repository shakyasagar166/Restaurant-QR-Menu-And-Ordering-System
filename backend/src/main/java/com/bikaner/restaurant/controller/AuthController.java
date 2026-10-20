package com.bikaner.restaurant.controller;

import com.bikaner.restaurant.model.AdminUser;
import com.bikaner.restaurant.repository.AdminUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AdminUserRepository adminUserRepository;

    // Fallback defaults
    private static final String DEFAULT_PHONE = "9058605348";
    private static final String DEFAULT_PASSWORD = "shivamshakya098";
    private static final String DEFAULT_PIN = "9058";
    private static final String DEFAULT_NAME = "Shivam Shakya (Manager)";

    // In-memory token store for ultra-fast session validation
    private static final Map<String, Map<String, Object>> activeTokens = new HashMap<>();

    public AuthController(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @PostConstruct
    public void seedDefaultAdmin() {
        try {
            if (adminUserRepository.count() == 0) {
                AdminUser defaultAdmin = new AdminUser(
                    DEFAULT_PHONE,
                    DEFAULT_PASSWORD,
                    DEFAULT_PIN,
                    DEFAULT_NAME,
                    "ADMIN"
                );
                adminUserRepository.save(defaultAdmin);
                System.out.println("✅ Default Admin & PIN Initialized: Phone " + DEFAULT_PHONE + ", PIN " + DEFAULT_PIN);
            }
        } catch (Exception e) {
            System.err.println("Warning: Admin user init notice: " + e.getMessage());
        }
    }

    // 1. FAST 4-DIGIT TOUCHPIN LOGIN
    @PostMapping("/pin-login")
    public ResponseEntity<Map<String, Object>> pinLogin(@RequestBody Map<String, String> payload) {
        String pin = payload.get("pin");
        Map<String, Object> response = new HashMap<>();

        if (pin == null || pin.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Please enter 4-digit staff PIN.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String cleanedPin = pin.trim();

        // 1. Check against MySQL database
        Optional<AdminUser> userOpt = adminUserRepository.findByQuickPin(cleanedPin);

        // Fallback check if DB has not yet loaded
        if (userOpt.isEmpty() && DEFAULT_PIN.equals(cleanedPin)) {
            AdminUser temp = new AdminUser(DEFAULT_PHONE, DEFAULT_PASSWORD, DEFAULT_PIN, DEFAULT_NAME, "ADMIN");
            userOpt = Optional.of(temp);
        }

        if (userOpt.isPresent()) {
            AdminUser user = userOpt.get();
            String token = "bikaner_auth_" + UUID.randomUUID().toString();
            Map<String, Object> session = new HashMap<>();
            session.put("phone", user.getPhone());
            session.put("name", user.getName());
            session.put("role", user.getRole());
            session.put("quickPin", user.getQuickPin());
            session.put("loginTime", System.currentTimeMillis());

            activeTokens.put(token, session);

            response.put("success", true);
            response.put("token", token);
            response.put("phone", user.getPhone());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("quickPin", user.getQuickPin());
            response.put("message", "PIN Verified! Welcome " + user.getName());

            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid 4-digit PIN. Please try again.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // 2. STANDARD PHONE & PASSWORD LOGIN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String phone = credentials.get("phone");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();

        if (phone == null || password == null) {
            response.put("success", false);
            response.put("message", "Phone and password required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        String cleanedPhone = phone.trim();
        String cleanedPass = password.trim();

        // Check against MySQL Database
        Optional<AdminUser> userOpt = adminUserRepository.findByPhone(cleanedPhone);

        // Fallback for default credentials
        if (userOpt.isEmpty() && DEFAULT_PHONE.equals(cleanedPhone) && DEFAULT_PASSWORD.equals(cleanedPass)) {
            AdminUser temp = new AdminUser(DEFAULT_PHONE, DEFAULT_PASSWORD, DEFAULT_PIN, DEFAULT_NAME, "ADMIN");
            userOpt = Optional.of(temp);
        }

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(cleanedPass)) {
            AdminUser user = userOpt.get();
            String token = "bikaner_auth_" + UUID.randomUUID().toString();
            Map<String, Object> session = new HashMap<>();
            session.put("phone", user.getPhone());
            session.put("name", user.getName());
            session.put("role", user.getRole());
            session.put("quickPin", user.getQuickPin());
            session.put("loginTime", System.currentTimeMillis());

            activeTokens.put(token, session);

            response.put("success", true);
            response.put("token", token);
            response.put("phone", user.getPhone());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("quickPin", user.getQuickPin());
            response.put("message", "Welcome " + user.getName() + "! Authentication successful.");

            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid credentials. Please enter correct Phone & Password.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // 3. CHANGE PASSWORD & PIN (SAVES PERMANENTLY IN MYSQL DATABASE)
    @PostMapping("/change-credentials")
    public ResponseEntity<Map<String, Object>> changeCredentials(@RequestBody Map<String, String> payload) {
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");
        String newPin = payload.get("newPin");
        String newPhone = payload.get("newPhone");
        String newName = payload.get("newName");

        Map<String, Object> response = new HashMap<>();

        // Find primary admin user in database
        AdminUser admin = adminUserRepository.findAll().stream().findFirst().orElse(null);
        if (admin == null) {
            admin = new AdminUser(DEFAULT_PHONE, DEFAULT_PASSWORD, DEFAULT_PIN, DEFAULT_NAME, "ADMIN");
        }

        // Verify current password or current PIN for security
        boolean isCurrentValid = (currentPassword != null && currentPassword.trim().equals(admin.getPassword())) ||
                                 (currentPassword != null && currentPassword.trim().equals(admin.getQuickPin())) ||
                                 DEFAULT_PASSWORD.equals(currentPassword);

        if (!isCurrentValid) {
            response.put("success", false);
            response.put("message", "Incorrect Current Password. Security verification failed.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Apply updates
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            admin.setPassword(newPassword.trim());
        }
        if (newPin != null && !newPin.trim().isEmpty()) {
            admin.setQuickPin(newPin.trim());
        }
        if (newPhone != null && !newPhone.trim().isEmpty()) {
            admin.setPhone(newPhone.trim());
        }
        if (newName != null && !newName.trim().isEmpty()) {
            admin.setName(newName.trim());
        }
        admin.setUpdatedAt(LocalDateTime.now());

        adminUserRepository.save(admin);

        response.put("success", true);
        response.put("message", "Security Credentials successfully updated in Database!");
        response.put("phone", admin.getPhone());
        response.put("quickPin", admin.getQuickPin());
        response.put("name", admin.getName());

        return ResponseEntity.ok(response);
    }

    // 4. VERIFY ACTIVE SESSION
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

    // 5. LOGOUT
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

    // 6. FORGOT PASSWORD & RECOVERY RESET
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        String masterRecoveryKey = payload.get("masterKey");
        String newPassword = payload.get("newPassword");
        String newPin = payload.get("newPin");

        Map<String, Object> response = new HashMap<>();

        // Master Restaurant Key for recovery: "BIKANER2026" or manager phone "9058605348"
        boolean isMasterValid = masterRecoveryKey != null && (
            "BIKANER2026".equalsIgnoreCase(masterRecoveryKey.trim()) ||
            "9058605348".equals(masterRecoveryKey.trim()) ||
            "AMANMALL".equalsIgnoreCase(masterRecoveryKey.trim())
        );

        if (!isMasterValid) {
            response.put("success", false);
            response.put("message", "Invalid Master Recovery Key. Recovery access rejected.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        AdminUser admin = adminUserRepository.findAll().stream().findFirst().orElse(null);
        if (admin == null) {
            admin = new AdminUser(DEFAULT_PHONE, DEFAULT_PASSWORD, DEFAULT_PIN, DEFAULT_NAME, "ADMIN");
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            admin.setPassword(newPassword.trim());
        }
        if (newPin != null && !newPin.trim().isEmpty()) {
            admin.setQuickPin(newPin.trim());
        }
        if (phone != null && !phone.trim().isEmpty()) {
            admin.setPhone(phone.trim());
        }
        admin.setUpdatedAt(LocalDateTime.now());
        adminUserRepository.save(admin);

        // Auto-login session token
        String token = "bikaner_auth_" + UUID.randomUUID().toString();
        Map<String, Object> session = new HashMap<>();
        session.put("phone", admin.getPhone());
        session.put("name", admin.getName());
        session.put("role", admin.getRole());
        session.put("quickPin", admin.getQuickPin());
        session.put("loginTime", System.currentTimeMillis());
        activeTokens.put(token, session);

        response.put("success", true);
        response.put("token", token);
        response.put("phone", admin.getPhone());
        response.put("name", admin.getName());
        response.put("role", admin.getRole());
        response.put("quickPin", admin.getQuickPin());
        response.put("message", "Credentials successfully reset! Password & PIN updated in Database.");

        return ResponseEntity.ok(response);
    }
}
