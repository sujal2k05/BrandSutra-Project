package com.brandsutra.service;

import com.brandsutra.dto.org.AddMemberRequest;
import com.brandsutra.dto.org.CreateOrgRequest;
import com.brandsutra.dto.org.OrgMemberDto;
import com.brandsutra.dto.org.OrganizationDto;
import com.brandsutra.entity.*;
import com.brandsutra.exception.BadRequestException;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.repository.BrandProfileRepository;
import com.brandsutra.repository.OrganizationMemberRepository;
import com.brandsutra.repository.OrganizationRepository;
import com.brandsutra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public OrganizationDto getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + id));
        return mapToDto(org);
    }

    @Transactional
    public OrganizationDto updateOrganization(Long id, CreateOrgRequest request, User currentUser) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + id));

        org.setName(request.getName());
        org.setIndustry(request.getIndustry());
        org.setWebsite(request.getWebsite());
        org.setDescription(request.getDescription());
        org = organizationRepository.save(org);

        auditService.logAction(org, currentUser, "ORG_UPDATED", "ORGANIZATION", org.getId(),
                "Updated organization details: " + org.getName());

        return mapToDto(org);
    }

    @Transactional(readOnly = true)
    public List<OrgMemberDto> getOrganizationMembers(Long orgId) {
        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(orgId);
        return members.stream().map(m -> OrgMemberDto.builder()
                .id(m.getId())
                .userId(m.getUser().getId())
                .email(m.getUser().getEmail())
                .fullName(m.getUser().getFullName())
                .roleInOrg(m.getRoleInOrg())
                .status(m.getStatus())
                .joinedAt(m.getJoinedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public OrgMemberDto addMember(Long orgId, AddMemberRequest request, User currentUser) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + orgId));

        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Create user with default temporary password
            user = User.builder()
                    .email(email)
                    .fullName(request.getFullName())
                    .passwordHash(passwordEncoder.encode("Welcome@123"))
                    .role(request.getRole())
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        } else {
            // Update role if changed
            user.setRole(request.getRole());
            user = userRepository.save(user);
        }

        if (organizationMemberRepository.existsByOrganizationIdAndUserId(orgId, user.getId())) {
            throw new BadRequestException("User is already a member of this organization");
        }

        OrganizationMember member = OrganizationMember.builder()
                .organization(org)
                .user(user)
                .roleInOrg(request.getRole())
                .status("ACTIVE")
                .build();
        member = organizationMemberRepository.save(member);

        auditService.logAction(org, currentUser, "MEMBER_ADDED", "ORGANIZATION_MEMBER", member.getId(),
                "Added user " + user.getEmail() + " as " + request.getRole());

        return OrgMemberDto.builder()
                .id(member.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roleInOrg(member.getRoleInOrg())
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .build();
    }

    private OrganizationDto mapToDto(Organization org) {
        return OrganizationDto.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .industry(org.getIndustry())
                .website(org.getWebsite())
                .description(org.getDescription())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
