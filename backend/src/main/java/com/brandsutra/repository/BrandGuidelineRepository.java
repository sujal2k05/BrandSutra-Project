package com.brandsutra.repository;

import com.brandsutra.entity.BrandGuideline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandGuidelineRepository extends JpaRepository<BrandGuideline, Long> {
    List<BrandGuideline> findByOrganizationId(Long organizationId);
    List<BrandGuideline> findByOrganizationIdAndIsApprovedTrue(Long organizationId);
}
