package com.harmony.crm.web;

import com.harmony.crm.domain.Task;
import com.harmony.crm.enums.TaskStatus;
import com.harmony.crm.service.TaskService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Tasks")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> list(@RequestParam(required = false) String assignedTo,
                           @RequestParam(required = false) String status) {
        return taskService.list(assignedTo,
                status == null || status.isBlank() ? null : TaskStatus.fromJson(status));
    }

    @GetMapping("/{id}")
    public Task get(@PathVariable String id) {
        return taskService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@Valid @RequestBody Task task) {
        return taskService.create(task);
    }

    @PatchMapping("/{id}")
    public Task patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return taskService.patch(id, body);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        taskService.delete(id);
    }
}
