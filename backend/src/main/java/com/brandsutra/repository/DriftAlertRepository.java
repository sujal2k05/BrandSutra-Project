package com.brandsutra.repository;

import com.brandsutra.entity.DriftAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriftAlertRepository extends JpaRepository<DriftAlert, Long> {
    List<DriftAlert> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    List<DriftAlert> findByOrganizationIdAndIsReviewedFalseOrderByCreatedAtDesc(Long organizationId);
    long countByOrganizationIdAndIsReviewedFalse(Long organizationId);
}

