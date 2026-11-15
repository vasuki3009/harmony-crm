package com.harmony.crm.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.harmony.crm.enums.UserRole;
import com.harmony.crm.enums.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    @Column(unique = true, nullable = false)
    private String email;

    /** BCrypt hash. Never serialised to JSON (and cannot be set through a JSON body). */
    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserRole role = UserRole.EMPLOYEE;

    /** Department name, e.g. "Sales" (kept as plain text to match the frontend model). */
    private String department;

    private String avatar;
    private String phone;
    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
}
