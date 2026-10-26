package com.brandsutra.service;

import com.brandsutra.entity.AuditLog;
import com.brandsutra.entity.Organization;
import com.brandsutra.entity.User;
import com.brandsutra.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(Organization organization, User user, String action, String entityType, Long entityId, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .organization(organization)
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to persist audit log: {}", e.getMessage());
        }
    }
}
