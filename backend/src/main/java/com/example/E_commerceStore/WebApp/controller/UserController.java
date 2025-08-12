package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5174")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // สร้างผู้ใช้ใหม่
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            User user = userService.registerUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );
            
            // ไม่ส่ง password กลับ
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // เข้าสู่ระบบ (Simple login - ในโปรเจ็กต์จริงควรใช้ Spring Security)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.findByEmail(request.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // ในโปรเจ็กต์จริงควรใช้ password encoder
            if (user.getPassword().equals(request.getPassword())) {
                userService.updateLastLogin(user);
                user.setPassword(null); // ไม่ส่ง password กลับ
                return ResponseEntity.ok(user);
            }
        }
        
        return ResponseEntity.badRequest().body("Invalid email or password");
    }
    
    // ดูข้อมูลผู้ใช้
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        if (user.isPresent()) {
            User u = user.get();
            u.setPassword(null); // ไม่ส่ง password กลับ
            return ResponseEntity.ok(u);
        }
        return ResponseEntity.notFound().build();
    }
    
    // อัปเดตข้อมูลผู้ใช้
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setAddress(updatedUser.getAddress());
            
            User savedUser = userService.updateUser(user);
            savedUser.setPassword(null);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    }
    
    // ดูผู้ใช้ทั้งหมด (เฉพาะ Admin)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        users.forEach(user -> user.setPassword(null)); // ไม่ส่ง password กลับ
        return ResponseEntity.ok(users);
    }
    
    // สร้าง Admin (สำหรับ development)
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody UserRegistrationRequest request) {
        try {
            User admin = userService.createAdmin(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );
            
            admin.setPassword(null);
            return ResponseEntity.ok(admin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // DTOs
    public static class UserRegistrationRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }
    
    public static class LoginRequest {
        private String email;
        private String password;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
