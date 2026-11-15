package com.harmony.crm.dto;

import com.harmony.crm.domain.Department;

import java.time.LocalDate;

/** Department plus a live employee count (computed from the users table, not stored). */
public record DepartmentResponse(String id, String name, String headId, String description,
                                 LocalDate createdAt, long employeeCount) {

    public static DepartmentResponse of(Department d, long employeeCount) {
        return new DepartmentResponse(d.getId(), d.getName(), d.getHeadId(), d.getDescription(),
                d.getCreatedAt(), employeeCount);
    }
}
