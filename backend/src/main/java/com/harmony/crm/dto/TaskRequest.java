package com.harmony.crm.dto;

import com.harmony.crm.enums.TaskPriority;
import com.harmony.crm.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

/** Body of POST /api/tasks. */
public record TaskRequest(
        @NotBlank String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        String assignedTo,
        String createdBy,
        LocalDate dueDate,
        String leadId,
        Integer comments,
        List<String> tags) {
}
