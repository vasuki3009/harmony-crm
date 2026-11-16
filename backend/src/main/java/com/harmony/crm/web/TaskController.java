package com.harmony.crm.web;

import com.harmony.crm.domain.Task;
import com.harmony.crm.dto.TaskRequest;
import com.harmony.crm.dto.TaskResponse;
import com.harmony.crm.enums.TaskStatus;
import com.harmony.crm.service.TaskService;
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

@Tag(name = "Tasks")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Set<String> SORT_FIELDS = Set.of("title", "status", "priority", "dueDate");

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @Operation(summary = "List tasks",
            description = "Optional filters: assignedTo, status. Same paging rules as /api/leads "
                    + "(page, size, sort = title|status|priority|dueDate).")
    @GetMapping
    public ResponseEntity<List<TaskResponse>> list(@RequestParam(required = false) String assignedTo,
                                                   @RequestParam(required = false) String status,
                                                   @RequestParam(required = false) Integer page,
                                                   @RequestParam(defaultValue = "20") int size,
                                                   @RequestParam(defaultValue = "dueDate,asc") String sort) {
        Page<Task> result = taskService.search(
                assignedTo,
                status == null || status.isBlank() ? null : TaskStatus.fromJson(status),
                SortParam.pageable(page, size, SortParam.parse(sort, SORT_FIELDS)));
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(result.getTotalElements()))
                .header("X-Total-Pages", String.valueOf(result.getTotalPages()))
                .body(result.getContent().stream().map(TaskResponse::from).toList());
    }

    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable String id) {
        return TaskResponse.from(taskService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return TaskResponse.from(taskService.create(request));
    }

    @PatchMapping("/{id}")
    public TaskResponse patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return TaskResponse.from(taskService.patch(id, body));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        taskService.delete(id);
    }
}
