package com.brandsutra.repository;

import com.brandsutra.entity.BrandProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandProfileRepository extends JpaRepository<BrandProfile, Long> {
    Optional<BrandProfile> findByOrganizationId(Long organizationId);
}
