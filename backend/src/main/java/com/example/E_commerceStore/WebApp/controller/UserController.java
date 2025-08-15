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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, allowCredentials = "true")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // สร้างผู้ใช้ใหม่
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            User user;
            if (request.getUsername() != null || request.getGender() != null || request.getAge() != null) {
                user = userService.registerUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getUsername(),
                    request.getGender(),
                    request.getAge()
                );
            } else {
                user = userService.registerUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName()
                );
            }
            
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
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser, jakarta.servlet.http.HttpSession session) {
        // Authorization: only owner or admin can update
        Object sessionUserObj = session.getAttribute("user");
        if (!(sessionUserObj instanceof com.example.E_commerceStore.WebApp.model.User sessionUser)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (!sessionUser.getId().equals(id) && !sessionUser.isAdmin()) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        // Update only allowed fields if provided (ignore nulls)
        if (updatedUser.getFirstName() != null) user.setFirstName(updatedUser.getFirstName());
        if (updatedUser.getLastName() != null) user.setLastName(updatedUser.getLastName());
        if (updatedUser.getPhoneNumber() != null) user.setPhoneNumber(updatedUser.getPhoneNumber());
        if (updatedUser.getAddress() != null) user.setAddress(updatedUser.getAddress());
        if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
        if (updatedUser.getGender() != null) user.setGender(updatedUser.getGender());
        if (updatedUser.getAge() != null) user.setAge(updatedUser.getAge());

        User savedUser = userService.updateUser(user);
        savedUser.setPassword(null);
        // also refresh session user if same person
        if (sessionUser.getId().equals(id)) {
            session.setAttribute("user", savedUser);
        }
        return ResponseEntity.ok(savedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, jakarta.servlet.http.HttpSession session) {
        // Authorization: only owner or admin can delete
        Object sessionUserObj = session.getAttribute("user");
        if (!(sessionUserObj instanceof com.example.E_commerceStore.WebApp.model.User sessionUser)) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        if (!sessionUser.getId().equals(id) && !sessionUser.isAdmin()) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        Optional<User> userOpt = userService.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userService.deleteUser(id);
        // If the user deleted themselves, invalidate session
        if (sessionUser.getId().equals(id)) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
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
        private String username;
        private com.example.E_commerceStore.WebApp.model.Gender gender;
        private Integer age;
        
        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public com.example.E_commerceStore.WebApp.model.Gender getGender() { return gender; }
    public void setGender(com.example.E_commerceStore.WebApp.model.Gender gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
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
