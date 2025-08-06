package com.example.E_commerceStore.WebApp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class OAuth2Controller {

    @GetMapping("/oauth2/test")
    @ResponseBody
    public String testOAuth2() {
        return "OAuth2 Controller is working! Backend is ready for Google login.";
    }

    @GetMapping("/auth/success")
    public RedirectView authSuccess(@RequestParam(value = "token", required = false) String token) {
        if (token != null && !token.isEmpty()) {
            // Redirect to frontend with token
            return new RedirectView("http://localhost:5173/auth/success?token=" + token);
        } else {
            // Redirect to frontend success page without token (for debugging)
            return new RedirectView("http://localhost:5173/auth/success");
        }
    }

    @GetMapping("/auth/error")
    public RedirectView authError(@RequestParam(value = "error", required = false) String error) {
        // Redirect to frontend error page
        return new RedirectView("http://localhost:5173/auth/error?error=" + (error != null ? error : "unknown_error"));
    }
}
