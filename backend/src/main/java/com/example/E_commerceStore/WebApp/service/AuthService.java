package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import com.example.E_commerceStore.WebApp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    // 🔐 Authentication Methods
    public User authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("ไม่พบบัญชีผู้ใช้ที่ใช้อีเมลนี้");
        }
        
        User user = userOpt.get();
        
        if (user.getPassword() == null) {
            throw new RuntimeException("บัญชีนี้ใช้การเข้าสู่ระบบผ่าน Social Media กรุณาใช้ปุ่ม Google หรือ Facebook");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("รหัสผ่านไม่ถูกต้อง");
        }
        
        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        return user;
    }

    public User registerUser(String email, String password, String firstName, String lastName, String phoneNumber) {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        }

        // Check if phone number already exists (if provided)
        if (phoneNumber != null && !phoneNumber.trim().isEmpty() && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new RuntimeException("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhoneNumber(phoneNumber);
        user.setRole(UserRole.CUSTOMER);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(email, firstName);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
        
        return savedUser;
    }

    // 📧 Password Reset Methods
    public void initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("ไม่พบบัญชีผู้ใช้ที่ใช้อีเมลนี้");
        }
        
        User user = userOpt.get();
        
        if (user.getPassword() == null) {
            throw new RuntimeException("บัญชีนี้ใช้การเข้าสู่ระบบผ่าน Social Media ไม่สามารถรีเซ็ตรหัสผ่านได้");
        }
        
        // Generate reset token
        String resetToken = jwtUtil.generateResetToken(email);
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // 1 hour expiry
        
        userRepository.save(user);
        
        // Send reset email
        emailService.sendPasswordResetEmail(email, resetToken);
    }

    public void resetPassword(String token, String newPassword) {
        // Validate token
        if (!jwtUtil.validateToken(token) || !"reset".equals(jwtUtil.getTokenType(token))) {
            throw new RuntimeException("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว");
        }
        
        // Find user by token
        Optional<User> userOpt = userRepository.findByValidResetToken(token, LocalDateTime.now());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว");
        }
        
        User user = userOpt.get();
        
        // Update password and clear reset token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userRepository.save(user);
    }

    // 🌐 OAuth2 Methods
    public User createOrUpdateOAuth2User(String providerId, String providerUserId, String email, String firstName, String lastName) {
        // Check if user exists with OAuth2 provider
        Optional<User> existingOAuth2User = userRepository.findByProviderIdAndProviderUserId(providerId, providerUserId);
        if (existingOAuth2User.isPresent()) {
            User user = existingOAuth2User.get();
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        
        // Check if user exists with same email
        Optional<User> existingEmailUser = userRepository.findByEmail(email);
        if (existingEmailUser.isPresent()) {
            User user = existingEmailUser.get();
            // Link OAuth2 account to existing email account
            user.setProviderId(providerId);
            user.setProviderUserId(providerUserId);
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        }
        
        // Create new user from OAuth2
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setProviderId(providerId);
        user.setProviderUserId(providerUserId);
        user.setRole(UserRole.CUSTOMER);
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLoginAt(LocalDateTime.now());
        // No password for OAuth2 users
        
        User savedUser = userRepository.save(user);
        
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(email, firstName);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
        
        return savedUser;
    }

    // 🔑 JWT Token Generation
    public String generateToken(User user) {
        return jwtUtil.generateToken(user.getEmail());
    }
}
