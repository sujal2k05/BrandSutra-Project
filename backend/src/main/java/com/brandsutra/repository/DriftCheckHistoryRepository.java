package com.brandsutra.repository;

import com.brandsutra.entity.DriftCheckHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriftCheckHistoryRepository extends JpaRepository<DriftCheckHistory, Long> {
    List<DriftCheckHistory> findBySourceIdOrderByCheckedAtDesc(Long sourceId);
}

