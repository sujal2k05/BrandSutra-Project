package com.brandsutra.controller;

import com.brandsutra.dto.approval.ApprovalDecisionDto;
import com.brandsutra.dto.approval.ApprovalRequest;
import com.brandsutra.dto.content.SubmissionResponseDto;
import com.brandsutra.entity.DecisionType;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    private final UserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<SubmissionResponseDto>> getPendingSubmissions(
            @RequestParam("orgId") Long orgId
    ) {
        return ResponseEntity.ok(approvalService.getPendingSubmissions(orgId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmissionResponseDto> submitForReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(approvalService.submitForReview(id, user));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('REVIEWER', 'ADMIN')")
    public ResponseEntity<ApprovalDecisionDto> approveSubmission(
            @PathVariable Long id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User reviewer = userRepository.getReferenceById(principal.getId());
        if (request == null) {
            request = new ApprovalRequest(DecisionType.APPROVED, "Approved by reviewer.");
        } else {
            request.setDecision(DecisionType.APPROVED);
        }
        return ResponseEntity.ok(approvalService.reviewSubmission(id, request, reviewer));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('REVIEWER', 'ADMIN')")
    public ResponseEntity<ApprovalDecisionDto> rejectSubmission(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User reviewer = userRepository.getReferenceById(principal.getId());
        request.setDecision(DecisionType.REJECTED);
        return ResponseEntity.ok(approvalService.reviewSubmission(id, request, reviewer));
    }

    @PostMapping("/{id}/request-changes")
    @PreAuthorize("hasAnyRole('REVIEWER', 'ADMIN')")
    public ResponseEntity<ApprovalDecisionDto> requestChanges(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User reviewer = userRepository.getReferenceById(principal.getId());
        request.setDecision(DecisionType.CHANGES_REQUESTED);
        return ResponseEntity.ok(approvalService.reviewSubmission(id, request, reviewer));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ApprovalDecisionDto>> getApprovalHistory(@PathVariable Long id) {
        return ResponseEntity.ok(approvalService.getSubmissionApprovalHistory(id));
    }
}
