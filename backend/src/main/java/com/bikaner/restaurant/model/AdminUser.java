package com.bikaner.restaurant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 10)
    private String quickPin = "9058";

    private String name = "Shivam Shakya";

    private String role = "ADMIN";

    private LocalDateTime updatedAt = LocalDateTime.now();

    public AdminUser() {}

    public AdminUser(String phone, String password, String quickPin, String name, String role) {
        this.phone = phone;
        this.password = password;
        this.quickPin = quickPin;
        this.name = name;
        this.role = role;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getQuickPin() { return quickPin; }
    public void setQuickPin(String quickPin) { this.quickPin = quickPin; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
