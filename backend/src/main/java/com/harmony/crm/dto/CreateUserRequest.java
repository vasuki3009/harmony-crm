package com.harmony.crm.dto;

import com.harmony.crm.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, message = "must be at least 6 characters") String password,
        UserRole role,
        String department,
        String phone) {
}
