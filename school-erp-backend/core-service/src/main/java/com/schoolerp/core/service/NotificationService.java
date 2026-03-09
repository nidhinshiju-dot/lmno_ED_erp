package com.schoolerp.core.service;

import com.schoolerp.core.entity.Notification;
import com.schoolerp.core.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final PushNotificationService pushNotificationService;

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnread(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public Notification create(Notification notification) {
        return notificationRepository.save(notification);
    }

    public void broadcast(com.schoolerp.core.dto.NotificationPayload payload) {
        // Save a record of the broadcast for audit logs
        Notification notif = new Notification();
        notif.setUserId("BROADCAST");
        notif.setTitle(payload.getTitle());
        notif.setMessage(payload.getMessage());
        notif.setType("ANNOUNCEMENT");
        notif.setReferenceId(payload.getTargetId());
        Notification saved = notificationRepository.save(notif);

        // Map payload scope to FCM Topic logic
        String topic = payload.getScope();
        if ("CLASS".equals(topic) && payload.getTargetId() != null) {
            topic = "CLASS_" + payload.getTargetId();
        }

        // Send via PushNotificationService including the mobile intent
        pushNotificationService.sendTopicNotification(
            topic, 
            payload.getTitle(), 
            payload.getMessage() + " [intent: VIEW_MESSAGE, id: " + saved.getId() + "]"
        );
    }
}
