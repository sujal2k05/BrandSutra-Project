package com.brandsutra.controller;

import com.brandsutra.dto.dashboard.AnalyticsDataDto;
import com.brandsutra.dto.dashboard.DashboardSummaryDto;
import com.brandsutra.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@RequestParam("orgId") Long orgId) {
        return ResponseEntity.ok(dashboardService.getSummary(orgId));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AnalyticsDataDto> getAnalytics(@RequestParam("orgId") Long orgId) {
        return ResponseEntity.ok(dashboardService.getAnalytics(orgId));
    }
}
