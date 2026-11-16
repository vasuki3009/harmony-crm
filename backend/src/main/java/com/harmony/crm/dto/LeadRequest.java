package com.harmony.crm.dto;

import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

/** Body of POST /api/leads. Optional fields fall back to sensible defaults in the service. */
public record LeadRequest(
        @NotBlank String name,
        @Email String email,
        String phone,
        String company,
        LeadStatus status,
        LeadTemperature temperature,
        @Min(0) @Max(100) Integer score,
        String assignedTo,
        @Min(0) Double value,
        String source,
        String notes,
        LocalDate lastContact,
        List<String> tags) {
}
