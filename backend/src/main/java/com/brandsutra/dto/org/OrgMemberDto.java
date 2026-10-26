package com.brandsutra.dto.org;

import com.brandsutra.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgMemberDto {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private Role roleInOrg;
    private String status;
    private LocalDateTime joinedAt;
}
