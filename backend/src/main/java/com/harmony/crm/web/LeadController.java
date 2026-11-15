package com.harmony.crm.web;

import com.harmony.crm.domain.Lead;
import com.harmony.crm.domain.LeadActivity;
import com.harmony.crm.dto.ActivityRequest;
import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;
import com.harmony.crm.service.LeadService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Leads")
@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    public List<Lead> list(@RequestParam(required = false) String status,
                           @RequestParam(required = false) String temperature,
                           @RequestParam(required = false) String assignedTo,
                           @RequestParam(required = false) String q) {
        return leadService.list(
                blank(status) ? null : LeadStatus.fromJson(status),
                blank(temperature) ? null : LeadTemperature.fromJson(temperature),
                assignedTo, q);
    }

    @GetMapping("/{id}")
    public Lead get(@PathVariable String id) {
        return leadService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Lead create(@Valid @RequestBody Lead lead) {
        return leadService.create(lead);
    }

    @PatchMapping("/{id}")
    public Lead patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return leadService.patch(id, body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        leadService.delete(id);
    }

    @GetMapping("/{id}/activities")
    public List<LeadActivity> activities(@PathVariable String id) {
        return leadService.activities(id);
    }

    @PostMapping("/{id}/activities")
    @ResponseStatus(HttpStatus.CREATED)
    public LeadActivity addActivity(@PathVariable String id, @Valid @RequestBody ActivityRequest request) {
        return leadService.addActivity(id, request.type(), request.description());
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
