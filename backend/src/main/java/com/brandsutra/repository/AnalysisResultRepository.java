package com.brandsutra.repository;

import com.brandsutra.entity.AnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    Optional<AnalysisResult> findByVersionId(Long versionId);
}
