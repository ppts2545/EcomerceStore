package com.example.E_commerceStore.WebApp.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, 
                               Authentication authentication) throws IOException, ServletException {
        
        System.out.println("🚪 Logout successful - redirecting to frontend");
        
        // Clear any remaining session data
        request.getSession().invalidate();
        
        // Redirect to frontend with logout parameter
        response.sendRedirect("http://localhost:5174/?logout=success");
    }
}
