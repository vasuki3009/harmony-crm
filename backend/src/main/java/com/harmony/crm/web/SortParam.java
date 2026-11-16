package com.harmony.crm.web;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * Turns the optional ?page=&size=&sort=field,dir query parameters into a Spring Data Pageable.
 * Only whitelisted fields can be sorted on, so clients cannot pass arbitrary property names.
 */
final class SortParam {

    private static final int MAX_PAGE_SIZE = 100;

    private SortParam() {
    }

    /** "value,desc" -> Sort. Throws IllegalArgumentException (HTTP 400) for unknown fields. */
    static Sort parse(String sort, Set<String> allowedFields) {
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        if (!allowedFields.contains(field)) {
            throw new IllegalArgumentException("Cannot sort by '" + field + "'. Allowed: " + allowedFields);
        }
        Sort.Direction direction = parts.length > 1
                ? Sort.Direction.fromString(parts[1].trim())
                : Sort.Direction.ASC;
        return Sort.by(direction, field);
    }

    /** No page parameter means "return everything" so older clients keep working. */
    static Pageable pageable(Integer page, int size, Sort sort) {
        if (page == null) {
            return Pageable.unpaged(sort);
        }
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("page must be >= 0 and size must be between 1 and " + MAX_PAGE_SIZE);
        }
        return PageRequest.of(page, size, sort);
    }
}
