package com.brandsutra.repository;

import com.brandsutra.entity.ContentSubmission;
import com.brandsutra.entity.SubmissionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentSubmissionRepository extends JpaRepository<ContentSubmission, Long> {
    List<ContentSubmission> findByOrganizationId(Long organizationId);
    List<ContentSubmission> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    List<ContentSubmission> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
    List<ContentSubmission> findByOrganizationIdAndOverallStatusOrderByCreatedAtDesc(Long organizationId, SubmissionStatus status);
    
    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndOverallStatus(Long organizationId, SubmissionStatus status);

    @Query("SELECT COUNT(s) FROM ContentSubmission s WHERE s.organization.id = :orgId AND s.overallStatus IN :statuses")
    long countByOrganizationIdAndOverallStatusIn(@Param("orgId") Long orgId, @Param("statuses") List<SubmissionStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ContentSubmission s WHERE s.id = :id")
    Optional<ContentSubmission> findByIdForUpdate(@Param("id") Long id);
}
