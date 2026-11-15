package com.harmony.crm.domain;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * String ids (not auto-increment numbers) so the JSON matches the React types
 * (id: string). Seed data uses readable ids such as "u1" and "l1".
 */
@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @jakarta.persistence.Column(length = 64)
    private String id;

    @PrePersist
    void assignId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
