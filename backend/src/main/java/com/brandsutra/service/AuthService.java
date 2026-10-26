package com.brandsutra.service;

import com.brandsutra.dto.auth.LoginRequest;
import com.brandsutra.dto.auth.LoginResponse;
import com.brandsutra.dto.auth.RegisterRequest;
import com.brandsutra.dto.auth.UserDto;
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

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("User already exists with email: " + request.getEmail());
        }

        // 1. Create User as ADMIN of their new organization
        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // 2. Create Organization
        String slug = generateSlug(request.getOrganizationName());
        Organization organization = Organization.builder()
                .name(request.getOrganizationName())
                .slug(slug)
                .industry(request.getIndustry() != null ? request.getIndustry() : "Consumer Products")
                .description("Organization workspace for " + request.getOrganizationName())
                .build();
        organization = organizationRepository.save(organization);

        // 3. Add User as ADMIN Member
        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(user)
                .roleInOrg(Role.ADMIN)
                .status("ACTIVE")
                .build();
        organizationMemberRepository.save(member);

        // 4. Initialize Brand Profile
        BrandProfile profile = BrandProfile.builder()
                .organization(organization)
                .brandName(request.getOrganizationName())
                .voiceTone("Professional and Friendly")
                .mission("Excellence in customer value and trusted communication.")
                .toneGuidelines("Maintain clear, verified, and honest brand messaging across all marketing channels.")
                .build();
        brandProfileRepository.save(profile);

        auditService.logAction(organization, user, "USER_REGISTERED", "USER", user.getId(),
                "Registered new admin and initialized organization: " + organization.getName());

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

        // Lookup Organization
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(user.getId());
        Long orgId = null;
        String orgName = null;

        if (!memberships.isEmpty()) {
            Organization org = memberships.get(0).getOrganization();
            orgId = org.getId();
            orgName = org.getName();
        }

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .organizationId(orgId)
                .organizationName(orgName)
                .build();

        return LoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            throw new BadRequestException("No authenticated user found in security context");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<OrganizationMember> memberships = organizationMemberRepository.findByUserId(user.getId());
        Long orgId = null;
        String orgName = null;

        if (!memberships.isEmpty()) {
            Organization org = memberships.get(0).getOrganization();
            orgId = org.getId();
            orgName = org.getName();
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .organizationId(orgId)
                .organizationName(orgName)
                .build();
    }

    private String generateSlug(String name) {
        String base = name.toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-");
        if (base.startsWith("-")) base = base.substring(1);
        if (base.endsWith("-")) base = base.substring(0, base.length() - 1);
        if (base.isEmpty()) base = "org";
        String candidate = base;
        int count = 1;
        while (organizationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + count++;
        }
        return candidate;
    }
}
