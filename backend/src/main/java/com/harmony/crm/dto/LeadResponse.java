package com.harmony.crm.dto;

import com.harmony.crm.domain.Lead;
import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;

import java.time.LocalDate;
import java.util.List;

/** What the API returns for a lead (the JPA entity itself is never exposed). */
public record LeadResponse(
        String id,
        String name,
        String email,
        String phone,
        String company,
        LeadStatus status,
        LeadTemperature temperature,
        int score,
        String assignedTo,
        double value,
        String source,
        String notes,
        LocalDate createdAt,
        LocalDate updatedAt,
        LocalDate lastContact,
        List<String> tags) {

    public static LeadResponse from(Lead l) {
        return new LeadResponse(l.getId(), l.getName(), l.getEmail(), l.getPhone(), l.getCompany(),
                l.getStatus(), l.getTemperature(), l.getScore(), l.getAssignedTo(), l.getValue(),
                l.getSource(), l.getNotes(), l.getCreatedAt(), l.getUpdatedAt(), l.getLastContact(),
                List.copyOf(l.getTags()));
    }
}
