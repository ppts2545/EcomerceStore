package com.example.E_commerceStore.WebApp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // อ่านจาก application.properties (ค่าเริ่มต้น "uploads")
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ทำพาธให้เป็น absolute + normalize
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // ต้องลงท้ายด้วย "/" และใช้ URI ที่ Spring เข้าใจ (file:///…)
        String location = uploadPath.toUri().toString(); // เช่น file:///C:/project/uploads/ หรือ file:/opt/app/uploads/

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(0); // dev: ปิด cache (ปรับตามเหมาะสม)
    }
}