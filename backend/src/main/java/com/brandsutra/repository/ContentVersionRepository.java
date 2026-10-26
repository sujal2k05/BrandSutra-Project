package com.brandsutra.repository;

import com.brandsutra.entity.ContentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContentVersionRepository extends JpaRepository<ContentVersion, Long> {
    List<ContentVersion> findBySubmissionIdOrderByVersionNumberDesc(Long submissionId);
    Optional<ContentVersion> findBySubmissionIdAndVersionNumber(Long submissionId, Integer versionNumber);
    
    @Query("SELECT MAX(v.versionNumber) FROM ContentVersion v WHERE v.submission.id = :submissionId")
    Integer findMaxVersionNumberBySubmissionId(@Param("submissionId") Long submissionId);

    @Query("SELECT AVG(v.riskScore) FROM ContentVersion v WHERE v.submission.organization.id = :orgId")
    Double findAverageRiskScoreByOrganizationId(@Param("orgId") Long orgId);

    @Query("SELECT COUNT(v) FROM ContentVersion v WHERE v.submission.organization.id = :orgId AND v.riskScore >= 41")
    long countHighRiskVersionsByOrganizationId(@Param("orgId") Long orgId);
}
