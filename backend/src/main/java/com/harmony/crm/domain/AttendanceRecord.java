package com.harmony.crm.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.harmony.crm.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "attendance_records")
public class AttendanceRecord extends BaseEntity {

    private String userId;
    @Column(name = "record_date")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkIn;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime checkOut;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    private Double hoursWorked;
}
