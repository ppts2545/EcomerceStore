package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.service.UserService;
import com.example.E_commerceStore.WebApp.util.JwtUtil;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserRepository userRepository;

    // 📝 Registration
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        try {
            User user = userService.registerUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            // Store user in session
            session.setAttribute("user", user);
            session.setAttribute("token", token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "สมัครสมาชิกสำเร็จ!");
            response.put("user", createUserResponse(user));
            response.put("token", token);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 🔐 Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        try {
            User user = userService.authenticate(request.getEmail(), request.getPassword());
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            // Store user in session
            session.setAttribute("user", user);
            session.setAttribute("token", token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "เข้าสู่ระบบสำเร็จ!");
            response.put("user", createUserResponse(user));
            response.put("token", token);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 🚪 Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "ออกจากระบบสำเร็จ");
        
        return ResponseEntity.ok(response);
    }

    // 👤 Get Current User
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        
        // If no user in session, check OAuth2 authentication
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof OAuth2User) {
                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                String email = oauth2User.getAttribute("email");
                
                if (email != null) {
                    Optional<User> oauthUser = userRepository.findByEmail(email);
                    if (oauthUser.isPresent()) {
                        user = oauthUser.get();
                        // Store in session for future requests
                        session.setAttribute("user", user);
                        session.setAttribute("userId", user.getId());
                        System.out.println("✅ OAuth2 user found and stored in session: " + email);
                    }
                }
            }
        }
        
        if (user == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "ไม่ได้เข้าสู่ระบบ");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Refresh user data from database
        Optional<User> freshUser = userService.findById(user.getId());
        if (freshUser.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "ไม่พบข้อมูลผู้ใช้");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Update session with fresh data
        session.setAttribute("user", freshUser.get());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", createUserResponse(freshUser.get()));
        
        return ResponseEntity.ok(response);
    }

    // � Keep Session Alive - เรียกเพื่อรีเฟรช Session
    @PostMapping("/keep-alive")
    public ResponseEntity<?> keepSessionAlive(HttpSession session) {
        User user = (User) session.getAttribute("user");
        
        if (user == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "ไม่ได้เข้าสู่ระบบ");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // รีเฟรช session timeout
        session.setMaxInactiveInterval(7 * 24 * 60 * 60); // 7 วัน
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Session refreshed successfully");
        response.put("sessionId", session.getId());
        response.put("maxInactiveInterval", session.getMaxInactiveInterval());
        response.put("user", createUserResponse(user));
        
        return ResponseEntity.ok(response);
    }

    // 📊 Session Info - ดูข้อมูล Session
    @GetMapping("/session-info")
    public ResponseEntity<?> getSessionInfo(HttpSession session) {
        User user = (User) session.getAttribute("user");
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("sessionId", session.getId());
        response.put("isLoggedIn", user != null);
        response.put("maxInactiveInterval", session.getMaxInactiveInterval());
        response.put("lastAccessedTime", session.getLastAccessedTime());
        response.put("creationTime", session.getCreationTime());
        
        if (user != null) {
            response.put("user", createUserResponse(user));
        }
        
        return ResponseEntity.ok(response);
    }

    // �🔑 Forgot Password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            userService.initiatePasswordReset(request.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมล");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 🔄 Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "รีเซ็ตรหัสผ่านสำเร็จ!");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // ✅ Check Email Availability
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean taken = userService.isEmailTaken(email);
        
        Map<String, Object> response = new HashMap<>();
        response.put("available", !taken);
        response.put("message", taken ? "อีเมลนี้ถูกใช้งานแล้ว" : "อีเมลนี้ใช้งานได้");
        
        return ResponseEntity.ok(response);
    }

    // 🔄 OAuth2 Success (called after successful OAuth2 login)
    @GetMapping("/oauth2/success")
    public ResponseEntity<?> oauth2Success(@AuthenticationPrincipal OAuth2User oauth2User, HttpSession session) {
        if (oauth2User == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OAuth2 authentication failed");
        }

        try {
            // Extract user info from OAuth2User
            String email = oauth2User.getAttribute("email");
            String firstName = oauth2User.getAttribute("given_name");
            String lastName = oauth2User.getAttribute("family_name");
            String provider = "google"; // or facebook based on registration
            String providerId = oauth2User.getAttribute("sub");

            if (firstName == null) firstName = oauth2User.getAttribute("name");
            if (lastName == null) lastName = "";

            // Create or update user
            User user = userService.createOrUpdateOAuth2User(email, firstName, lastName, provider, providerId);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            // Store user in session
            session.setAttribute("user", user);
            session.setAttribute("token", token);
            
            // Redirect to frontend with success
            return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:5174/?auth=success")
                .build();
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:5174/?auth=error&message=" + e.getMessage())
                .build();
        }
    }

    // 🛠️ Helper method to create user response without sensitive data
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("role", user.getRole());
        userResponse.put("createdAt", user.getCreatedAt());
        userResponse.put("lastLoginAt", user.getLastLoginAt());
        userResponse.put("oauth2Provider", user.getOauth2Provider());
        
        return userResponse;
    }

    // 📝 DTO Classes
    public static class RegisterRequest {
        @NotBlank(message = "อีเมลห้ามว่าง")
        @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
        private String email;
        
        @NotBlank(message = "รหัสผ่านห้ามว่าง")
        @Size(min = 6, message = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
        private String password;
        
        @NotBlank(message = "ชื่อห้ามว่าง")
        private String firstName;
        
        @NotBlank(message = "นามสกุลห้ามว่าง")
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
        @NotBlank(message = "อีเมลห้ามว่าง")
        @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
        private String email;
        
        @NotBlank(message = "รหัสผ่านห้ามว่าง")
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ForgotPasswordRequest {
        @NotBlank(message = "อีเมลห้ามว่าง")
        @Email(message = "รูปแบบอีเมลไม่ถูกต้อง")
        private String email;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class ResetPasswordRequest {
        @NotBlank(message = "โทเค่นห้ามว่าง")
        private String token;
        
        @NotBlank(message = "รหัสผ่านใหม่ห้ามว่าง")
        @Size(min = 6, message = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
        private String newPassword;

        // Getters and setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
