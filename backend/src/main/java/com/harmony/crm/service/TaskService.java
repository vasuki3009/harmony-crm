package com.harmony.crm.service;

import com.harmony.crm.domain.Task;
import com.harmony.crm.dto.TaskRequest;
import com.harmony.crm.enums.TaskStatus;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.TaskRepository;
import com.harmony.crm.repository.TaskSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TaskService {

    private final TaskRepository tasks;
    private final UserService userService;
    private final PatchHelper patcher;

    public TaskService(TaskRepository tasks, UserService userService, PatchHelper patcher) {
        this.tasks = tasks;
        this.userService = userService;
        this.patcher = patcher;
    }

    @Transactional(readOnly = true)
    public Page<Task> search(String assignedTo, TaskStatus status, Pageable pageable) {
        var spec = TaskSpecifications.filter(assignedTo, status);
        if (pageable.isUnpaged()) {
            return new PageImpl<>(tasks.findAll(spec, pageable.getSort()));
        }
        return tasks.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Task get(String id) {
        return tasks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    public Task create(TaskRequest req) {
        Task task = Task.builder()
                .title(req.title())
                .description(req.description())
                .assignedTo(req.assignedTo())
                .createdBy(req.createdBy() != null ? req.createdBy() : userService.currentUser().getId())
                .dueDate(req.dueDate())
                .leadId(req.leadId())
                .comments(req.comments() == null ? 0 : req.comments())
                .tags(req.tags() == null ? new ArrayList<>() : new ArrayList<>(req.tags()))
                .build();
        if (req.status() != null) {
            task.setStatus(req.status());
        }
        if (req.priority() != null) {
            task.setPriority(req.priority());
        }
        if (task.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDate.now());
        }
        return tasks.save(task);
    }

    /** Partial update. Moving to "completed" stamps completedAt; moving away clears it. */
    public Task patch(String id, Map<String, Object> body) {
        Task task = get(id);
        TaskStatus before = task.getStatus();
        patcher.apply(task, body, "completedAt", "createdBy");
        if (before != TaskStatus.COMPLETED && task.getStatus() == TaskStatus.COMPLETED) {
            task.setCompletedAt(LocalDate.now());
        } else if (before == TaskStatus.COMPLETED && task.getStatus() != TaskStatus.COMPLETED) {
            task.setCompletedAt(null);
        }
        return tasks.save(task);
    }

    public void delete(String id) {
        tasks.delete(get(id));
    }

    /** Runs every night at 01:00: open tasks whose due date has passed become "overdue". */
    @Scheduled(cron = "0 0 1 * * *")
    public int markOverdue() {
        LocalDate today = LocalDate.now();
        List<Task> late = tasks.findAll().stream()
                .filter(t -> (t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS)
                        && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .toList();
        late.forEach(t -> t.setStatus(TaskStatus.OVERDUE));
        tasks.saveAll(late);
        return late.size();
    }
}
