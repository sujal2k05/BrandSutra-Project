package com.brandsutra.repository;

import com.brandsutra.entity.ApprovalDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalDecisionRepository extends JpaRepository<ApprovalDecision, Long> {
    List<ApprovalDecision> findBySubmissionIdOrderByDecidedAtDesc(Long submissionId);
    List<ApprovalDecision> findByVersionId(Long versionId);
    List<ApprovalDecision> findByReviewerIdOrderByDecidedAtDesc(Long reviewerId);
    List<ApprovalDecision> findTop10BySubmissionOrganizationIdOrderByDecidedAtDesc(Long organizationId);
}
