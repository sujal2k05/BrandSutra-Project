package com.brandsutra.repository;

import com.brandsutra.entity.SelfHealingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SelfHealingSessionRepository extends JpaRepository<SelfHealingSession, Long> {
    List<SelfHealingSession> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    List<SelfHealingSession> findBySubmissionIdOrderByCreatedAtDesc(Long submissionId);
}

