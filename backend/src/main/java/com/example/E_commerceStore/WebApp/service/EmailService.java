package com.example.E_commerceStore.WebApp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("รีเซ็ตรหัสผ่าน - E-Commerce Store");
        
        String resetUrl = "http://localhost:5174/reset-password?token=" + resetToken;
        String emailBody = String.format(
            "สวัสดีครับ/ค่ะ,\n\n" +
            "คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี E-Commerce Store\n\n" +
            "กรุณาคลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน:\n" +
            "%s\n\n" +
            "ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง\n\n" +
            "หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้\n\n" +
            "ขอบคุณครับ/ค่ะ\n" +
            "ทีม E-Commerce Store",
            resetUrl
        );
        
        message.setText(emailBody);
        
        try {
            mailSender.send(message);
            System.out.println("✅ Password reset email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to: " + toEmail);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง");
        }
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("ยินดีต้อนรับสู่ E-Commerce Store!");
        
        String emailBody = String.format(
            "สวัสดี %s!\n\n" +
            "ยินดีต้อนรับสู่ E-Commerce Store 🎉\n\n" +
            "บัญชีของคุณได้ถูกสร้างเรียบร้อยแล้ว\n" +
            "ตอนนี้คุณสามารถเข้าสู่ระบบและเริ่มช้อปปิ้งได้เลย!\n\n" +
            "หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อเรา\n\n" +
            "ขอบคุณที่เลือกใช้บริการ E-Commerce Store\n\n" +
            "ทีม E-Commerce Store",
            firstName
        );
        
        message.setText(emailBody);
        
        try {
            mailSender.send(message);
            System.out.println("✅ Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send welcome email to: " + toEmail);
            // Don't throw exception for welcome email failure
        }
    }
}
