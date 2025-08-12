package com.example.E_commerceStore.WebApp.config;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import com.example.E_commerceStore.WebApp.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component  
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String googleId = oauth2User.getAttribute("sub");
            
            System.out.println("🔐 OAuth2 Success: " + email + " (" + name + ")");
            
            // Find or create user
            Optional<User> existingUser = userRepository.findByEmail(email);
            User user;
            
            if (existingUser.isPresent()) {
                user = existingUser.get();
                user.setLastLoginAt(LocalDateTime.now());
                // Update OAuth2 info if not set
                if (user.getOauth2Provider() == null) {
                    user.setOauth2Provider("google");
                    user.setOauth2ProviderId(googleId);
                }
                System.out.println("✅ Updated existing user: " + email);
            } else {
                // Create new user
                user = new User();
                user.setEmail(email);
                user.setFirstName(name != null ? name.split(" ")[0] : "User");
                if (name != null && name.contains(" ")) {
                    user.setLastName(name.substring(name.indexOf(" ") + 1));
                } else {
                    user.setLastName("");
                }
                user.setPassword(""); // OAuth2 users don't need password
                user.setOauth2Provider("google");
                user.setOauth2ProviderId(googleId);
                user.setRole(UserRole.CUSTOMER);
                user.setCreatedAt(LocalDateTime.now());
                user.setLastLoginAt(LocalDateTime.now());
                
                System.out.println("🆕 Created new user: " + email);
            }
            
            userRepository.save(user);
            System.out.println("💾 User saved to database!");
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail());
            
            // 🔑 เก็บ User ใน Session หลังจาก Spring Security จัดการ session fixation แล้ว
            // เก็บ user ใน session ที่ใหม่หลังจาก session fixation protection
            request.getSession().setAttribute("user", user);
            System.out.println("🔐 User stored in session: " + user.getEmail());
            System.out.println("📊 Session ID: " + request.getSession().getId());
            
            // Also store user ID for alternative lookup
            request.getSession().setAttribute("userId", user.getId());
            System.out.println("🆔 User ID stored in session: " + user.getId());
            
            // Store user in request attributes as well for immediate access
            request.setAttribute("authenticatedUser", user);
            
            // Redirect to frontend with user info and token
            String frontendUrl = "http://localhost:5173/auth/success?token=" + token +
                               "&email=" + email + 
                               "&name=" + name;
            
            System.out.println("🚀 Redirecting to: " + frontendUrl);
            getRedirectStrategy().sendRedirect(request, response, frontendUrl);
            
        } catch (Exception e) {
            System.err.println("❌ OAuth2 Success Handler Error: " + e.getMessage());
            e.printStackTrace();
            // Redirect to frontend with error
            getRedirectStrategy().sendRedirect(request, response, 
                "http://localhost:5173/auth/error?error=oauth2_login_failed");
        }
    }
}