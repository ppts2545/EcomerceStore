package com.example.E_commerceStore.WebApp.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class OAuth2DebugController {

    @Value("${frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @GetMapping("/login/oauth2/code/google")
    @ResponseBody
    public String handleGoogleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletRequest request) {
        
        StringBuilder debug = new StringBuilder();
        debug.append("<h2>🔍 OAuth2 Debug Information</h2>");
        debug.append("<h3>Request URL: ").append(request.getRequestURL()).append("</h3>");
        debug.append("<h3>Query String: ").append(request.getQueryString()).append("</h3>");
        debug.append("<h3>Parameters:</h3>");
        debug.append("<ul>");
        debug.append("<li>code: ").append(code).append("</li>");
        debug.append("<li>state: ").append(state).append("</li>");
        debug.append("<li>error: ").append(error).append("</li>");
        debug.append("</ul>");
        
        debug.append("<h3>All Request Parameters:</h3>");
        debug.append("<ul>");
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            debug.append("<li>").append(entry.getKey()).append(": ");
            for (String value : entry.getValue()) {
                debug.append(value).append(" ");
            }
            debug.append("</li>");
        }
        debug.append("</ul>");
        
        debug.append("<h3>Headers:</h3>");
        debug.append("<ul>");
        request.getHeaderNames().asIterator().forEachRemaining(headerName -> {
            debug.append("<li>").append(headerName).append(": ").append(request.getHeader(headerName)).append("</li>");
        });
        debug.append("</ul>");
        
        if (error != null) {
            debug.append("<h3 style='color: red;'>❌ Error: ").append(error).append("</h3>");
        }
        
    debug.append("<hr>");
    String origin = request.getHeader("Origin");
    String base = origin != null && origin.startsWith("http://localhost:") ? origin : frontendBaseUrl;
    debug.append("<a href='").append(base).append("'>🏠 กลับไปหน้าหลัก</a>");
        
        return debug.toString();
    }

    @GetMapping("/auth/debug")
    @ResponseBody
    public String debugAuth(HttpServletRequest request) {
    String origin = request.getHeader("Origin");
    String base = origin != null && origin.startsWith("http://localhost:") ? origin : frontendBaseUrl;
    return "<h2>🔍 Auth Debug</h2>" +
           "<p>Session ID: " + request.getSession().getId() + "</p>" +
           "<p>Request URL: " + request.getRequestURL() + "</p>" +
           "<p>Context Path: " + request.getContextPath() + "</p>" +
           "<a href='/oauth2/authorization/google'>🔗 Test Google OAuth2</a><br>" +
           "<a href='" + base + "'>🏠 กลับไปหน้าหลัก</a>";
    }
}
