package com.example.E_commerceStore.WebApp.service;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    // 🔐 Authentication Methods
    public User authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("ไม่พบบัญชีผู้ใช้ที่ใช้อีเมลนี้");
        }
        
        User user = userOpt.get();
        
        // Check if this is a social login account
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
    
    // สร้างผู้ใช้ใหม่ (Registration)
    public User registerUser(String email, String password, String firstName, String lastName) {
        // ตรวจสอบว่า email มีอยู่แล้วหรือไม่
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        }
        
        // Hash password
        String hashedPassword = passwordEncoder.encode(password);
        
        User user = new User(email, hashedPassword, firstName, lastName);
        user.setRole(UserRole.USER);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Send welcome email
        try {
            emailService.sendWelcomeEmail(email, firstName);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send welcome email, but user created successfully");
        }
        
        return savedUser;
    }
    
    // สร้างหรืออัปเดตผู้ใช้จาก OAuth2 (Google, Facebook)
    public User createOrUpdateOAuth2User(String email, String firstName, String lastName, String provider, String providerId) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update OAuth2 info if not set
            if (user.getOauth2Provider() == null) {
                user.setOauth2Provider(provider);
                user.setOauth2ProviderId(providerId);
                user.setLastLoginAt(LocalDateTime.now());
                return userRepository.save(user);
            }
            // Update last login
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            // Create new OAuth2 user
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setOauth2Provider(provider);
            newUser.setOauth2ProviderId(providerId);
            newUser.setRole(UserRole.USER);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setLastLoginAt(LocalDateTime.now());
            // No password for OAuth2 users
            
            User savedUser = userRepository.save(newUser);
            
            // Send welcome email
            try {
                emailService.sendWelcomeEmail(email, firstName);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send welcome email for OAuth2 user");
            }
            
            return savedUser;
        }
    }
    
    // 🔑 Password Reset Methods
    public void initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            // Don't reveal that email doesn't exist for security
            return;
        }
        
        User user = userOpt.get();
        
        // Check if this is a social login account
        if (user.getPassword() == null) {
            throw new RuntimeException("บัญชีนี้ใช้การเข้าสู่ระบบผ่าน Social Media ไม่สามารถรีเซ็ตรหัสผ่านได้");
        }
        
        // Generate reset token (you would normally use JwtUtil here)
        String resetToken = java.util.UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1)); // 1 hour expiry
        
        userRepository.save(user);
        
        // Send reset email
        emailService.sendPasswordResetEmail(email, resetToken);
    }
    
    public void resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByPasswordResetToken(token);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("โทเค่นรีเซ็ตรหัสผ่านไม่ถูกต้อง");
        }
        
        User user = userOpt.get();
        
        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("โทเค่นรีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอรีเซ็ตใหม่");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        
        userRepository.save(user);
    }
    
    // หาผู้ใช้จาก email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    // หาผู้ใช้จาก ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    // อัปเดตเวลา login ล่าสุด
    public void updateLastLogin(User user) {
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    // ตรวจสอบว่า email ถูกใช้แล้วหรือไม่
    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // 📊 User Profile Methods
    public User updateUserProfile(Long userId, String firstName, String lastName) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("ไม่พบผู้ใช้");
        }
        
        User user = userOpt.get();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        
        return userRepository.save(user);
    }
    
    // อัปเดตข้อมูลผู้ใช้
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // ลบผู้ใช้
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
    
    // หาผู้ใช้ทั้งหมด
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    // หา Admin ทั้งหมด
    public List<User> findAllAdmins() {
        return userRepository.findByRole(UserRole.ADMIN);
    }
    
    // สร้าง Admin (สำหรับ development)
    public User createAdmin(String email, String password, String firstName, String lastName) {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists: " + email);
        }
        
        User admin = new User();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setRole(UserRole.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(admin);
    }
    
    // 🔍 Helper method for authentication validation
    public boolean validateUser(String email, String password) {
        try {
            authenticate(email, password);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
}
