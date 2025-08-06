package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/count")
    public String getUserCount() {
        long count = userRepository.count();
        return "Total users in database: " + count;
    }
    
    @GetMapping("/session")
    public ResponseEntity<?> getSessionInfo(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        response.put("success", true);
        response.put("sessionId", session.getId());
        response.put("isNew", session.isNew());
        response.put("creationTime", session.getCreationTime());
        response.put("lastAccessedTime", session.getLastAccessedTime());
        response.put("maxInactiveInterval", session.getMaxInactiveInterval());
        
        // Check attributes
        Map<String, Object> attributes = new HashMap<>();
        session.getAttributeNames().asIterator().forEachRemaining(name -> {
            Object value = session.getAttribute(name);
            if (value instanceof User) {
                User user = (User) value;
                attributes.put(name, Map.of(
                    "type", "User",
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "role", user.getRole().toString()
                ));
            } else {
                attributes.put(name, value != null ? value.toString() : "null");
            }
        });
        response.put("attributes", attributes);
        
        User user = (User) session.getAttribute("user");
        response.put("hasUser", user != null);
        if (user != null) {
            response.put("userEmail", user.getEmail());
            response.put("userRole", user.getRole().toString());
        }
        
        System.out.println("🔍 Debug Session Info:");
        System.out.println("  - Session ID: " + session.getId());
        System.out.println("  - User: " + (user != null ? user.getEmail() : "null"));
        System.out.println("  - Attributes: " + attributes.keySet());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/oauth2")
    public List<User> getOAuth2Users() {
        return userRepository.findAll().stream()
            .filter(user -> user.getOauth2Provider() != null)
            .toList();
    }
}
