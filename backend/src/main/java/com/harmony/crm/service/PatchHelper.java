package com.harmony.crm.service;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmony.crm.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Applies a partial JSON update (PATCH body) onto an existing entity.
 * Only the keys present in the body are changed; "id" and any protected fields are ignored.
 */
@Component
public class PatchHelper {

    private final ObjectMapper mapper;

    public PatchHelper(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    public <T> T apply(T target, Map<String, Object> patch, String... protectedFields) {
        Map<String, Object> copy = new HashMap<>(patch);
        copy.remove("id");
        for (String field : protectedFields) {
            copy.remove(field);
        }
        try {
            return mapper.updateValue(target, copy);
        } catch (JsonMappingException e) {
            throw new BadRequestException("Invalid value in request body: " + e.getOriginalMessage());
        }
    }
}
