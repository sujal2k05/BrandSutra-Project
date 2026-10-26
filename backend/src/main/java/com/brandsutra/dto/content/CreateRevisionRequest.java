package com.brandsutra.dto.content;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRevisionRequest {
    @NotBlank(message = "Revised content text is required")
    private String contentText;
}
