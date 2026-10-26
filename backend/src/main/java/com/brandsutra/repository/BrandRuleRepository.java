package com.brandsutra.repository;

import com.brandsutra.entity.BrandRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRuleRepository extends JpaRepository<BrandRule, Long> {
    List<BrandRule> findByOrganizationId(Long organizationId);
    List<BrandRule> findByOrganizationIdAndIsActiveTrue(Long organizationId);
}
