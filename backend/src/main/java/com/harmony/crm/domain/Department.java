package com.harmony.crm.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "departments")
public class Department extends BaseEntity {

    @NotBlank
    private String name;

    /** User id of the department head. */
    private String headId;

    private String description;
    private LocalDate createdAt;
}
