package com.harmony.crm.domain;

import com.harmony.crm.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    private String userId;
    private String title;

    @Column(length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    /** JSON name is "read" to match the frontend. */
    @Column(name = "is_read")
    @com.fasterxml.jackson.annotation.JsonProperty("read")
    private boolean read;

    private LocalDateTime createdAt;
}
