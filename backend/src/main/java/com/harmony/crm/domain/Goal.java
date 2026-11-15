package com.harmony.crm.domain;

import com.harmony.crm.enums.GoalPeriod;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "goals")
public class Goal extends BaseEntity {

    private String userId;

    @NotBlank
    private String title;

    @Column(name = "target_value")
    private double target;

    @Column(name = "current_value")
    private double current;
    private String unit;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GoalPeriod period = GoalPeriod.MONTHLY;

    private LocalDate dueDate;
}
