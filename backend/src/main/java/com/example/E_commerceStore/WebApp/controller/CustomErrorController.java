package com.example.E_commerceStore.WebApp.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class CustomErrorController implements ErrorController {
    @Value("${frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @RequestMapping("/error")
    @ResponseBody
    public String handleError(HttpServletRequest request) {
        
        Object status = request.getAttribute("javax.servlet.error.status_code");
        Object error = request.getAttribute("javax.servlet.error.exception");
        Object message = request.getAttribute("javax.servlet.error.message");
        
        StringBuilder errorInfo = new StringBuilder();
        errorInfo.append("<html><body>");
        errorInfo.append("<h2>🚨 Debug Error Information</h2>");
        errorInfo.append("<h3>Status Code: ").append(status != null ? status : "Unknown").append("</h3>");
        errorInfo.append("<h3>Error Message: ").append(message != null ? message : "No message").append("</h3>");
        errorInfo.append("<h3>Request URL: ").append(request.getRequestURL()).append("</h3>");
        errorInfo.append("<h3>Query String: ").append(request.getQueryString()).append("</h3>");
        errorInfo.append("<h3>Method: ").append(request.getMethod()).append("</h3>");
        
        errorInfo.append("<h3>Request Parameters:</h3>");
        errorInfo.append("<ul>");
        request.getParameterMap().forEach((key, values) -> {
            errorInfo.append("<li>").append(key).append(": ");
            for (String value : values) {
                errorInfo.append(value).append(" ");
            }
            errorInfo.append("</li>");
        });
        errorInfo.append("</ul>");
        
        if (error != null) {
            errorInfo.append("<h3 style='color: red;'>Exception: ").append(error.toString()).append("</h3>");
        }
        
        // Special handling for OAuth2 related errors
        String requestURI = request.getRequestURI();
        if (requestURI.contains("oauth2") || requestURI.contains("login")) {
            errorInfo.append("<hr>");
            errorInfo.append("<h3 style='color: blue;'>🔍 OAuth2 Debug Suggestions:</h3>");
            errorInfo.append("<ul>");
            errorInfo.append("<li>Check Google Console redirect URI: http://localhost:8082/login/oauth2/code/google</li>");
            errorInfo.append("<li>Verify SecurityConfig OAuth2 configuration</li>");
            errorInfo.append("<li>Check if Spring Security OAuth2 dependencies are correct</li>");
            errorInfo.append("</ul>");
        }
        
        errorInfo.append("<hr>");
    errorInfo.append("<a href='" + frontendBaseUrl + "' style='padding: 10px; background: #007bff; color: white; text-decoration: none;'>🏠 กลับไปหน้าหลัก</a>");
        errorInfo.append("<br><br>");
        errorInfo.append("<a href='/auth/debug' style='padding: 10px; background: #28a745; color: white; text-decoration: none;'>🔍 Debug OAuth2</a>");
        errorInfo.append("</body></html>");
        
        return errorInfo.toString();
    }
}
