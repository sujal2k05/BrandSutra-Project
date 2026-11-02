package com.brandsutra.repository;

import com.brandsutra.entity.AdversarialSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdversarialSimulationRepository extends JpaRepository<AdversarialSimulation, Long> {
    List<AdversarialSimulation> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    List<AdversarialSimulation> findBySubmissionIdOrderByCreatedAtDesc(Long submissionId);
}

