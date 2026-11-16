package com.harmony.crm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmony.crm.domain.Lead;
import com.harmony.crm.domain.LeadActivity;
import com.harmony.crm.domain.User;
import com.harmony.crm.dto.LeadRequest;
import com.harmony.crm.enums.ActivityType;
import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.LeadTemperature;
import com.harmony.crm.exception.BadRequestException;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.LeadActivityRepository;
import com.harmony.crm.repository.LeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Unit tests of the lead business rules: no Spring, no database, repositories are mocks. */
@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    LeadRepository leads;
    @Mock
    LeadActivityRepository activities;
    @Mock
    UserService userService;

    LeadService service;

    @BeforeEach
    void setUp() {
        PatchHelper patcher = new PatchHelper(new ObjectMapper().findAndRegisterModules());
        service = new LeadService(leads, activities, userService, patcher);
    }

    private static User currentUser() {
        User u = User.builder().name("Sarah").email("sarah@harmonycrm.io").build();
        u.setId("u2");
        return u;
    }

    private static Lead existingLead(LeadStatus status) {
        Lead lead = Lead.builder().name("Acme").status(status).temperature(LeadTemperature.WARM)
                .createdAt(LocalDate.now().minusDays(5)).updatedAt(LocalDate.now().minusDays(5)).build();
        lead.setId("l1");
        return lead;
    }

    @Test
    void createAppliesDefaultsStampsDatesAndLogsAnActivity() {
        when(leads.save(any(Lead.class))).thenAnswer(inv -> {
            Lead l = inv.getArgument(0);
            l.setId("new-id");
            return l;
        });
        when(leads.findById("new-id")).thenAnswer(inv -> Optional.of(Lead.builder().build()));
        when(userService.currentUser()).thenReturn(currentUser());
        when(activities.save(any(LeadActivity.class))).thenAnswer(inv -> inv.getArgument(0));

        Lead saved = service.create(new LeadRequest("Acme", "a@acme.com", null, "Acme", null, null,
                null, "u3", null, "Website", null, null, List.of("vip")));

        assertEquals("new-id", saved.getId());
        assertEquals(LeadStatus.NEW, saved.getStatus());                 // default
        assertEquals(LeadTemperature.COLD, saved.getTemperature());      // default
        assertEquals(0, saved.getScore());
        assertEquals(LocalDate.now(), saved.getCreatedAt());
        assertEquals(List.of("vip"), saved.getTags());

        ArgumentCaptor<LeadActivity> captor = ArgumentCaptor.forClass(LeadActivity.class);
        verify(activities).save(captor.capture());
        assertEquals(ActivityType.NOTE, captor.getValue().getType());
        assertEquals("u2", captor.getValue().getPerformedBy());
    }

    @Test
    void changingStatusWritesAStatusChangeActivity() {
        Lead lead = existingLead(LeadStatus.NEW);
        when(leads.findById("l1")).thenReturn(Optional.of(lead));
        when(leads.save(lead)).thenReturn(lead);
        when(userService.currentUser()).thenReturn(currentUser());
        when(activities.save(any(LeadActivity.class))).thenAnswer(inv -> inv.getArgument(0));

        Lead updated = service.patch("l1", Map.of("status", "contacted"));

        assertEquals(LeadStatus.CONTACTED, updated.getStatus());
        assertEquals(LocalDate.now(), updated.getUpdatedAt());
        ArgumentCaptor<LeadActivity> captor = ArgumentCaptor.forClass(LeadActivity.class);
        verify(activities).save(captor.capture());
        assertEquals(ActivityType.STATUS_CHANGE, captor.getValue().getType());
        assertEquals("Status changed: New → Contacted", captor.getValue().getDescription());
    }

    @Test
    void editingOtherFieldsDoesNotWriteAnActivity() {
        Lead lead = existingLead(LeadStatus.NEW);
        when(leads.findById("l1")).thenReturn(Optional.of(lead));
        when(leads.save(lead)).thenReturn(lead);

        Lead updated = service.patch("l1", Map.of("notes", "Call back on Monday", "score", 80));

        assertEquals("Call back on Monday", updated.getNotes());
        assertEquals(80, updated.getScore());
        verifyNoInteractions(activities);
    }

    @Test
    void patchCannotOverwriteIdOrCreatedAt() {
        Lead lead = existingLead(LeadStatus.NEW);
        LocalDate created = lead.getCreatedAt();
        when(leads.findById("l1")).thenReturn(Optional.of(lead));
        when(leads.save(lead)).thenReturn(lead);

        service.patch("l1", Map.of("id", "hacked", "createdAt", "1999-01-01", "name", "Renamed"));

        assertEquals("l1", lead.getId());
        assertEquals(created, lead.getCreatedAt());
        assertEquals("Renamed", lead.getName());
    }

    @Test
    void patchWithAnInvalidStatusIsABadRequest() {
        when(leads.findById("l1")).thenReturn(Optional.of(existingLead(LeadStatus.NEW)));

        assertThrows(BadRequestException.class, () -> service.patch("l1", Map.of("status", "banana")));
    }

    @Test
    void unknownLeadThrowsNotFound() {
        when(leads.findById("nope")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.get("nope"));
    }

    @Test
    void deleteRemovesTheActivityTimelineBeforeTheLead() {
        Lead lead = existingLead(LeadStatus.LOST);
        when(leads.findById("l1")).thenReturn(Optional.of(lead));

        service.delete("l1");

        InOrder order = inOrder(activities, leads);
        order.verify(activities).deleteByLeadId("l1");
        order.verify(leads).delete(lead);
    }
}
