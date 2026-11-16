package com.harmony.crm.dto;

import com.harmony.crm.domain.Task;
import com.harmony.crm.enums.TaskPriority;
import com.harmony.crm.enums.TaskStatus;

import java.time.LocalDate;
import java.util.List;

public record TaskResponse(
        String id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        String assignedTo,
        String createdBy,
        LocalDate dueDate,
        LocalDate completedAt,
        String leadId,
        int comments,
        List<String> tags) {

    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(), t.getStatus(), t.getPriority(),
                t.getAssignedTo(), t.getCreatedBy(), t.getDueDate(), t.getCompletedAt(), t.getLeadId(),
                t.getComments(), List.copyOf(t.getTags()));
    }
}
