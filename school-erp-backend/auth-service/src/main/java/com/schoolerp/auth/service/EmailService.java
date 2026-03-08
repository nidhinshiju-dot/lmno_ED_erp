package com.schoolerp.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Value("${spring.mail.username:noreply@schoolerp.app}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String to, String tempPassword) {
        String subject = "Password Reset Request";
        String text = "Hello,\n\n" +
                "We received a request to reset your password.\n" +
                "Your temporary password is: " + tempPassword + "\n\n" +
                "Please login and change your password immediately.\n\n" +
                "If you did not request this, please contact support.\n\n" +
                "Regards,\nSchool Administration";
        sendEmail(to, subject, text);
    }
}
