package com.harmony.crm.service;

import com.harmony.crm.domain.Task;
import com.harmony.crm.enums.TaskStatus;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.TaskRepository;
import com.harmony.crm.repository.TaskSpecifications;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    public List<Task> list(String assignedTo, TaskStatus status) {
        return tasks.findAll(TaskSpecifications.filter(assignedTo, status), Sort.by("dueDate"));
    }

    @Transactional(readOnly = true)
    public Task get(String id) {
        return tasks.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    public Task create(Task task) {
        task.setId(null);
        if (task.getCreatedBy() == null) {
            task.setCreatedBy(userService.currentUser().getId());
        }
        if (task.getStatus() == TaskStatus.COMPLETED && task.getCompletedAt() == null) {
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
