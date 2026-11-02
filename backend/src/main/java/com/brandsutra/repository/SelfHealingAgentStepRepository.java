package com.brandsutra.repository;

import com.brandsutra.entity.SelfHealingAgentStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SelfHealingAgentStepRepository extends JpaRepository<SelfHealingAgentStep, Long> {
    List<SelfHealingAgentStep> findBySessionIdOrderByIterationNumberAscIdAsc(Long sessionId);
    List<SelfHealingAgentStep> findBySessionIdOrderByIterationNumberAscCreatedAtAsc(Long sessionId);
}
