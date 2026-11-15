package com.harmony.crm.domain;

import com.harmony.crm.enums.TaskPriority;
import com.harmony.crm.enums.TaskStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    @NotBlank
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    private String assignedTo;
    private String createdBy;
    private LocalDate dueDate;
    private LocalDate completedAt;
    private String leadId;
    private int comments;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
