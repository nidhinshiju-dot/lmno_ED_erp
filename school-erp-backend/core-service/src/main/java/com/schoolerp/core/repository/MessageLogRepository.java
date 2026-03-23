package com.schoolerp.core.repository;

import com.schoolerp.core.entity.MessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageLogRepository extends JpaRepository<MessageLog, UUID> {
    List<MessageLog> findByRecipientPhoneOrderByCreatedAtDesc(String recipientPhone);
    MessageLog findByMessageId(String messageId);
}
