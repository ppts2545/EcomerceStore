package com.example.E_commerceStore.WebApp.config;

import com.example.E_commerceStore.WebApp.model.User;
import com.example.E_commerceStore.WebApp.model.UserRole;
import com.example.E_commerceStore.WebApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class UserDataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserService userService;
    
    @Override
    public void run(String... args) throws Exception {
        // สร้าง Admin account เริ่มต้น
        if (userService.findByEmail("admin@ecommerce.com").isEmpty()) {
            User admin = userService.createAdmin(
                "admin@ecommerce.com", 
                "admin123", 
                "Admin", 
                "User"
            );
            System.out.println("✅ Default admin created: " + admin.getEmail());
        }
        
        // สร้าง Test user
        if (userService.findByEmail("test@user.com").isEmpty()) {
            User testUser = userService.registerUser(
                "test@user.com", 
                "password123", 
                "Test", 
                "User"
            );
            System.out.println("✅ Test user created: " + testUser.getEmail());
        }
    }
}
