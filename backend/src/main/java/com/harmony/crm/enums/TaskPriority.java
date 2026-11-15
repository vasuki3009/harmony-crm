package com.harmony.crm.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TaskPriority {
    LOW, MEDIUM, HIGH, CRITICAL;

    /** Serialised as lower-case (e.g. IN_PROGRESS -> "in_progress") to match the React frontend. */
    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static TaskPriority fromJson(String value) {
        return valueOf(value.trim().toUpperCase());
    }
}
