package com.brandsutra.controller;

import com.brandsutra.dto.auth.LoginRequest;
import com.brandsutra.dto.auth.LoginResponse;
import com.brandsutra.dto.auth.RegisterRequest;
import com.brandsutra.dto.auth.UserDto;
import com.brandsutra.dto.org.OrganizationDto;
import com.brandsutra.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<OrganizationDto>> getPublicOrganizations() {
        return ResponseEntity.ok(authService.getPublicOrganizations());
    }
}
