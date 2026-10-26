package com.brandsutra.dto.auth;

import com.brandsutra.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Boolean isActive;
    private Long organizationId;
    private String organizationName;
}
