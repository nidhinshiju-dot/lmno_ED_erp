package com.schoolerp.core.service;

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
            // Log error but don't fail the business transaction if email fails
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    public void sendWelcomeEmail(String to, String name, String rawPassword) {
        String subject = "Welcome to School ERP Dashboard";
        String text = "Hello " + name + ",\n\n" +
                "Your account has been created successfully.\n" +
                "Email: " + to + "\n" +
                "Temporary Password: " + rawPassword + "\n\n" +
                "Please login and change your password immediately.\n\n" +
                "Regards,\nSchool Administration";
        sendEmail(to, subject, text);
    }

    public void sendAttendanceAlert(String parentEmail, String studentName, String date) {
        String subject = "Attendance Alert: " + studentName + " is Absent Today";
        String text = "Dear Parent,\n\n" +
                "We noticed that your child, " + studentName + ", is marked ABSENT on " + date + ".\n" +
                "If this is expected, you may ignore this message. Otherwise, please contact the school office.\n\n" +
                "Regards,\nSchool Administration";
        sendEmail(parentEmail, subject, text);
    }
}
