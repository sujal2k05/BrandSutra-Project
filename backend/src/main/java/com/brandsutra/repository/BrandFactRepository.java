package com.brandsutra.repository;

import com.brandsutra.entity.BrandFact;
import com.brandsutra.entity.BrandFactCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandFactRepository extends JpaRepository<BrandFact, Long> {
    List<BrandFact> findByOrganizationId(Long organizationId);
    List<BrandFact> findByOrganizationIdAndStatus(Long organizationId, String status);
    List<BrandFact> findByOrganizationIdAndCategory(Long organizationId, BrandFactCategory category);
}
