package com.example.E_commerceStore.WebApp.config;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import com.example.E_commerceStore.WebApp.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
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
            
            // 🔑 เซ็ต Session หลังจาก OAuth2 login สำเร็จ
            // ไม่ต้อง invalidate session เพราะ Spring Security จัดการให้แล้ว
            HttpSession session = request.getSession();
            
            // เซ็ต session attributes
            session.setAttribute("user", user);
            session.setAttribute("userId", user.getId());
            session.setMaxInactiveInterval(7 * 24 * 60 * 60); // 7 วัน
            
            System.out.println("🔐 User stored in session: " + user.getEmail());
            System.out.println("📊 Session ID: " + session.getId());
            System.out.println("⏰ Session timeout: " + session.getMaxInactiveInterval());
            
            // Redirect to frontend success page
            String frontendUrl = "http://localhost:5173/auth/success?email=" + email + 
                               "&userId=" + user.getId() +
                               "&sessionId=" + session.getId();
            
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