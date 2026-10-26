package com.brandsutra.repository;

import com.brandsutra.entity.AiFinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiFindingRepository extends JpaRepository<AiFinding, Long> {
    List<AiFinding> findByVersionId(Long versionId);
    List<AiFinding> findByAnalysisId(Long analysisId);

    @Query("SELECT f.category, COUNT(f) FROM AiFinding f WHERE f.version.submission.organization.id = :orgId GROUP BY f.category ORDER BY COUNT(f) DESC")
    List<Object[]> countFindingsByCategoryForOrg(@Param("orgId") Long orgId);

    @Query("SELECT f.severity, COUNT(f) FROM AiFinding f WHERE f.version.submission.organization.id = :orgId GROUP BY f.severity")
    List<Object[]> countFindingsBySeverityForOrg(@Param("orgId") Long orgId);
}
