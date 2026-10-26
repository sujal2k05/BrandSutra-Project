package com.brandsutra.controller;

import com.brandsutra.dto.org.AddMemberRequest;
import com.brandsutra.dto.org.CreateOrgRequest;
import com.brandsutra.dto.org.OrgMemberDto;
import com.brandsutra.dto.org.OrganizationDto;
import com.brandsutra.entity.User;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.UserPrincipal;
import com.brandsutra.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDto> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrganizationDto> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody CreateOrgRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(organizationService.updateOrganization(id, request, user));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<OrgMemberDto>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganizationMembers(id));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrgMemberDto> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        User user = userRepository.getReferenceById(principal.getId());
        return ResponseEntity.ok(organizationService.addMember(id, request, user));
    }
}
