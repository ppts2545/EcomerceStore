package com.example.E_commerceStore.WebApp.controller;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/debug")
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

    @GetMapping("/users/oauth2")
    public List<User> getOAuth2Users() {
        return userRepository.findAll().stream()
            .filter(user -> user.getOauth2Provider() != null)
            .toList();
    }
}
