package com.harmony.crm.web;

import com.harmony.crm.domain.Goal;
import com.harmony.crm.service.GoalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Goals")
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public List<Goal> list(@RequestParam(required = false) String userId) {
        return goalService.list(userId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @ResponseStatus(HttpStatus.CREATED)
    public Goal create(@Valid @RequestBody Goal goal) {
        return goalService.create(goal);
    }

    @PatchMapping("/{id}")
    public Goal patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return goalService.patch(id, body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        goalService.delete(id);
    }
}
