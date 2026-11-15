package com.harmony.crm.dto;

import com.harmony.crm.enums.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActivityRequest(@NotNull ActivityType type, @NotBlank String description) {
}
