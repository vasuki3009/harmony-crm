package com.harmony.crm.domain;

import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@Table(name = "leads")
public class Lead extends BaseEntity {

    @NotBlank
    private String name;

    @Email
    private String email;

    private String phone;
    private String company;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeadStatus status = LeadStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeadTemperature temperature = LeadTemperature.COLD;

    @Min(0)
    @Max(100)
    private int score;

    /** User id of the sales rep this lead is assigned to. */
    private String assignedTo;

    /** Deal value. Column is "deal_value" because VALUE is a reserved word in H2. */
    @Min(0)
    @Column(name = "deal_value")
    private double value;

    private String source;

    @Column(length = 2000)
    private String notes;

    private LocalDate createdAt;
    private LocalDate updatedAt;
    private LocalDate lastContact;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "lead_tags", joinColumns = @JoinColumn(name = "lead_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();
}
