package com.brandsutra.service;

import com.brandsutra.dto.auth.LoginRequest;
import com.brandsutra.dto.auth.LoginResponse;
import com.brandsutra.dto.auth.RegisterRequest;
import com.brandsutra.dto.auth.UserDto;
import com.brandsutra.dto.org.OrganizationDto;
import com.brandsutra.entity.*;
import com.brandsutra.exception.BadRequestException;
import com.brandsutra.exception.ResourceNotFoundException;
import com.brandsutra.repository.BrandProfileRepository;
import com.brandsutra.repository.OrganizationMemberRepository;
import com.brandsutra.repository.OrganizationRepository;
import com.brandsutra.repository.UserRepository;
import com.brandsutra.security.JwtService;
import com.brandsutra.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<OrganizationDto> getPublicOrganizations() {
        return organizationRepository.findAll().stream()
                .map(org -> OrganizationDto.builder()
                        .id(org.getId())
                        .name(org.getName())
                        .slug(org.getSlug())
                        .industry(org.getIndustry())
                        .website(org.getWebsite())
                        .description(org.getDescription())
                        .createdAt(org.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("User already exists with email: " + request.getEmail());
        }

        // Determine requested role (default to CONTENT_CREATOR)
        Role targetRole = request.getRole() != null ? request.getRole() : Role.CONTENT_CREATOR;

        // Determine target organization
        Organization organization;
        if (request.getOrganizationId() != null) {
            organization = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + request.getOrganizationId()));
        } else if (request.getOrganizationName() != null && !request.getOrganizationName().trim().isBlank()) {
            String orgName = request.getOrganizationName().trim();
            organization = organizationRepository.findByNameIgnoreCase(orgName)
                    .orElseGet(() -> {
                        String slug = generateSlug(orgName);
                        Organization newOrg = Organization.builder()
                                .name(orgName)
                                .slug(slug)
                                .industry(request.getIndustry() != null ? request.getIndustry() : "Consumer Products")
                                .description("Organization workspace for " + orgName)
                                .build();
                        newOrg = organizationRepository.save(newOrg);

                        // Initialize brand profile for new org
                        BrandProfile profile = BrandProfile.builder()
                                .organization(newOrg)
                                .brandName(orgName)
                                .voiceTone("Professional and Friendly")
                                .mission("Excellence in customer value and trusted communication.")
                                .toneGuidelines("Maintain clear, verified, and honest brand messaging across all marketing channels.")
                                .build();
                        brandProfileRepository.save(profile);
                        return newOrg;
                    });
        } else {
            // Default to the first existing organization in the system
            organization = organizationRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("No existing organization found. Please specify an organization name."));
        }

        // Enforce rule: Only one Admin account allowed per organization / system
        if (targetRole == Role.ADMIN) {
            boolean adminExists = organizationMemberRepository.findByOrganizationId(organization.getId())
                    .stream().anyMatch(m -> m.getRoleInOrg() == Role.ADMIN);
            if (adminExists) {
                throw new BadRequestException("An Administrator account already exists for " + organization.getName() +
                        ". Please register as a Content Creator or Reviewer.");
            }
        }

        // 1. Create User with the chosen role (CONTENT_CREATOR or REVIEWER)
        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(targetRole)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // 2. Add User as member with the selected role
        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(user)
                .roleInOrg(targetRole)
                .status("ACTIVE")
                .build();
        organizationMemberRepository.save(member);

        auditService.logAction(organization, user, "USER_REGISTERED", "USER", user.getId(),
                "Registered new " + targetRole + " in organization: " + organization.getName());

        UserPrincipal principal = UserPrincipal.create(user);
        String token = jwtService.generateToken(principal);

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .organizationId(organization.getId())
                .organizationName(organization.getName())
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization org = null;
        List<OrganizationMember> members = organizationMemberRepository.findByUserId(user.getId());
        if (!members.isEmpty()) {
            org = members.get(0).getOrganization();
        }

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .organizationId(org != null ? org.getId() : null)
                .organizationName(org != null ? org.getName() : null)
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new BadRequestException("No authenticated user found");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization org = null;
        List<OrganizationMember> members = organizationMemberRepository.findByUserId(user.getId());
        if (!members.isEmpty()) {
            org = members.get(0).getOrganization();
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .organizationId(org != null ? org.getId() : null)
                .organizationName(org != null ? org.getName() : null)
                .build();
    }

    private String generateSlug(String name) {
        String base = name.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (base.endsWith("-")) {
            base = base.substring(0, base.length() - 1);
        }
        if (base.isEmpty()) {
            base = "org";
        }
        String candidate = base;
        int count = 1;
        while (organizationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + count++;
        }
        return candidate;
    }
}
