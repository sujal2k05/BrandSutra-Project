package com.brandsutra.dto.org;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDto {
    private Long id;
    private String name;
    private String slug;
    private String industry;
    private String website;
    private String description;
    private LocalDateTime createdAt;
}
