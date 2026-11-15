package com.harmony.crm.repository;

import com.harmony.crm.domain.Task;
import com.harmony.crm.enums.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    public static Specification<Task> filter(String assignedTo, TaskStatus status) {
        Specification<Task> spec = Specification.where(null);
        if (assignedTo != null && !assignedTo.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedTo"), assignedTo));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        return spec;
    }
}
