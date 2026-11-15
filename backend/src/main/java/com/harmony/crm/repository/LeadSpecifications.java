package com.harmony.crm.repository;

import com.harmony.crm.domain.Lead;
import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;
import org.springframework.data.jpa.domain.Specification;

/** Builds a dynamic query: only the filters that are actually provided are applied. */
public final class LeadSpecifications {

    private LeadSpecifications() {
    }

    public static Specification<Lead> filter(LeadStatus status, LeadTemperature temperature,
                                             String assignedTo, String q) {
        Specification<Lead> spec = Specification.where(null);
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (temperature != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("temperature"), temperature));
        }
        if (assignedTo != null && !assignedTo.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedTo"), assignedTo));
        }
        if (q != null && !q.isBlank()) {
            String like = "%" + q.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("company")), like),
                    cb.like(cb.lower(root.get("email")), like)));
        }
        return spec;
    }
}
