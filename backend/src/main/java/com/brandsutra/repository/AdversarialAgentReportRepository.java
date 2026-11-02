package com.brandsutra.repository;

import com.brandsutra.entity.AdversarialAgentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdversarialAgentReportRepository extends JpaRepository<AdversarialAgentReport, Long> {
    List<AdversarialAgentReport> findBySimulationIdOrderByIdAsc(Long simulationId);
    List<AdversarialAgentReport> findBySimulationId(Long simulationId);
}
