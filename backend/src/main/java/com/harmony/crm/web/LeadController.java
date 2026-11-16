package com.harmony.crm.web;

import com.harmony.crm.domain.Lead;
import com.harmony.crm.domain.LeadActivity;
import com.harmony.crm.dto.ActivityRequest;
import com.harmony.crm.dto.LeadRequest;
import com.harmony.crm.dto.LeadResponse;
import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;
import com.harmony.crm.service.LeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Tag(name = "Leads")
@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private static final Set<String> SORT_FIELDS =
            Set.of("name", "company", "status", "temperature", "score", "value", "createdAt", "updatedAt");

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @Operation(summary = "List leads",
            description = "Optional filters: status, temperature, assignedTo, q (name/company/email). "
                    + "Without 'page' every match is returned. With 'page' (0-based) and 'size' (1-100) the "
                    + "result is paged; totals are in the X-Total-Count and X-Total-Pages headers. "
                    + "sort = field,asc|desc (name, company, status, temperature, score, value, createdAt, updatedAt).")
    @GetMapping
    public ResponseEntity<List<LeadResponse>> list(@RequestParam(required = false) String status,
                                                   @RequestParam(required = false) String temperature,
                                                   @RequestParam(required = false) String assignedTo,
                                                   @RequestParam(required = false) String q,
                                                   @RequestParam(required = false) Integer page,
                                                   @RequestParam(defaultValue = "20") int size,
                                                   @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Page<Lead> result = leadService.search(
                blank(status) ? null : LeadStatus.fromJson(status),
                blank(temperature) ? null : LeadTemperature.fromJson(temperature),
                assignedTo, q,
                SortParam.pageable(page, size, SortParam.parse(sort, SORT_FIELDS)));
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(result.getTotalElements()))
                .header("X-Total-Pages", String.valueOf(result.getTotalPages()))
                .body(result.getContent().stream().map(LeadResponse::from).toList());
    }

    @GetMapping("/{id}")
    public LeadResponse get(@PathVariable String id) {
        return LeadResponse.from(leadService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LeadResponse create(@Valid @RequestBody LeadRequest request) {
        return LeadResponse.from(leadService.create(request));
    }

    @PatchMapping("/{id}")
    public LeadResponse patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return LeadResponse.from(leadService.patch(id, body));
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
