package com.brandsutra.repository;

import com.brandsutra.entity.MonitoredSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonitoredSourceRepository extends JpaRepository<MonitoredSource, Long> {
    List<MonitoredSource> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    List<MonitoredSource> findByIsActiveTrue();
    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndIsActiveTrue(Long organizationId);
}

