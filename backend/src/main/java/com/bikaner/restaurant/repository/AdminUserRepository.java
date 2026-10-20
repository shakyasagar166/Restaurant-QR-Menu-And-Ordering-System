package com.bikaner.restaurant.repository;

import com.bikaner.restaurant.model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByPhone(String phone);
    Optional<AdminUser> findByQuickPin(String quickPin);
}
