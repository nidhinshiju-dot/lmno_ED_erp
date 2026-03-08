package com.schoolerp.core.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PushNotificationService {

    // In a real production app, this would use Firebase Cloud Messaging (FCM) Admin SDK
    // to send payload to device tokens.
    
    public void sendPushNotification(String deviceToken, String title, String body, Map<String, String> data) {
        try {
            // Stub: FirebaseApp.getInstance() ... FirebaseMessaging.getInstance().send(message)
            System.out.println(">>> PUSH NOTIFICATION SENT to token [" + deviceToken + "]");
            System.out.println("    Title: " + title);
            System.out.println("    Body: " + body);
            if (data != null && !data.isEmpty()) {
                System.out.println("    Data: " + data);
            }
        } catch (Exception e) {
            System.err.println("Failed to send push notification: " + e.getMessage());
        }
    }

    public void sendTopicNotification(String topic, String title, String body) {
        try {
            // Stub for Firebase Topic messaging (e.g. "class_10A_parents")
            System.out.println(">>> TOPIC NOTIFICATION SENT to topic [" + topic + "]");
            System.out.println("    Title: " + title);
            System.out.println("    Body: " + body);
        } catch (Exception e) {
            System.err.println("Failed to send topic notification: " + e.getMessage());
        }
    }
}
