package com.harmony.crm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmony.crm.domain.Task;
import com.harmony.crm.domain.User;
import com.harmony.crm.dto.TaskRequest;
import com.harmony.crm.enums.TaskPriority;
import com.harmony.crm.enums.TaskStatus;
import com.harmony.crm.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    TaskRepository tasks;
    @Mock
    UserService userService;

    TaskService service;

    @BeforeEach
    void setUp() {
        service = new TaskService(tasks, userService, new PatchHelper(new ObjectMapper().findAndRegisterModules()));
    }

    private static Task task(String id, TaskStatus status, LocalDate due) {
        Task t = Task.builder().title("Task " + id).status(status).dueDate(due).build();
        t.setId(id);
        return t;
    }

    @Test
    void createUsesTheLoggedInUserAsCreatorAndDefaultsToPendingMedium() {
        User me = User.builder().name("Sarah").email("sarah@harmonycrm.io").build();
        me.setId("u2");
        when(userService.currentUser()).thenReturn(me);
        when(tasks.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task created = service.create(new TaskRequest("Write proposal", null, null, null, "u3", null,
                LocalDate.now().plusDays(3), null, null, null));

        assertEquals("u2", created.getCreatedBy());
        assertEquals(TaskStatus.PENDING, created.getStatus());
        assertEquals(TaskPriority.MEDIUM, created.getPriority());
        assertNull(created.getCompletedAt());
        assertEquals(0, created.getComments());
    }

    @Test
    void completingATaskStampsCompletedAtAndReopeningClearsIt() {
        Task t = task("t1", TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(1));
        when(tasks.findById("t1")).thenReturn(Optional.of(t));
        when(tasks.save(t)).thenReturn(t);

        service.patch("t1", Map.of("status", "completed"));
        assertEquals(TaskStatus.COMPLETED, t.getStatus());
        assertEquals(LocalDate.now(), t.getCompletedAt());

        service.patch("t1", Map.of("status", "pending"));
        assertEquals(TaskStatus.PENDING, t.getStatus());
        assertNull(t.getCompletedAt());
    }

    @Test
    void markOverdueOnlyTouchesOpenTasksThatArePastDue() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Task pastDue = task("a", TaskStatus.PENDING, yesterday);
        Task inProgressPastDue = task("b", TaskStatus.IN_PROGRESS, yesterday);
        Task future = task("c", TaskStatus.PENDING, LocalDate.now().plusDays(2));
        Task done = task("d", TaskStatus.COMPLETED, yesterday);
        Task noDueDate = task("e", TaskStatus.PENDING, null);
        when(tasks.findAll()).thenReturn(List.of(pastDue, inProgressPastDue, future, done, noDueDate));

        int changed = service.markOverdue();

        assertEquals(2, changed);
        assertEquals(TaskStatus.OVERDUE, pastDue.getStatus());
        assertEquals(TaskStatus.OVERDUE, inProgressPastDue.getStatus());
        assertEquals(TaskStatus.PENDING, future.getStatus());
        assertEquals(TaskStatus.COMPLETED, done.getStatus());
        assertEquals(TaskStatus.PENDING, noDueDate.getStatus());
        verify(tasks).saveAll(List.of(pastDue, inProgressPastDue));
    }
}
