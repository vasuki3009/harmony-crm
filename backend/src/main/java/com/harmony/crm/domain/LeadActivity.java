package com.harmony.crm.domain;

import com.harmony.crm.enums.ActivityType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lead_activities")
public class LeadActivity extends BaseEntity {

    private String leadId;

    @Enumerated(EnumType.STRING)
    private ActivityType type;

    @NotBlank
    @Column(length = 1000)
    private String description;

    /** User id of who did it. */
    private String performedBy;

    private LocalDateTime createdAt;
}
