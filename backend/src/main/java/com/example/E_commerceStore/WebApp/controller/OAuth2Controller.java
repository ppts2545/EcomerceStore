package com.example.E_commerceStore.WebApp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class OAuth2Controller {

    @Value("${frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @GetMapping("/oauth2/test")
    @ResponseBody
    public String testOAuth2() {
        return "OAuth2 Controller is working! Backend is ready for Google login.";
    }

    @GetMapping("/auth/success")
    public RedirectView authSuccess(@RequestParam(value = "token", required = false) String token) {
        if (token != null && !token.isEmpty()) {
            return new RedirectView(frontendBaseUrl + "/auth/success?token=" + token);
        } else {
            return new RedirectView(frontendBaseUrl + "/auth/success");
        }
    }

    @GetMapping("/auth/error")
    public RedirectView authError(@RequestParam(value = "error", required = false) String error) {
    return new RedirectView(frontendBaseUrl + "/auth/error?error=" + (error != null ? error : "unknown_error"));
    }
}
