package com.harmony.crm.service;

import com.harmony.crm.domain.Lead;
import com.harmony.crm.domain.Task;
import com.harmony.crm.domain.User;
import com.harmony.crm.dto.AnalyticsDtos.DashboardStats;
import com.harmony.crm.dto.AnalyticsDtos.LeaderboardEntry;
import com.harmony.crm.dto.AnalyticsDtos.NameValue;
import com.harmony.crm.dto.AnalyticsDtos.SalesTrendPoint;
import com.harmony.crm.enums.LeadStatus;
import com.harmony.crm.enums.TaskStatus;
import com.harmony.crm.enums.UserStatus;
import com.harmony.crm.repository.LeadRepository;
import com.harmony.crm.repository.TaskRepository;
import com.harmony.crm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Read-only aggregations for the Dashboard and Analytics pages.
 * Data volumes in a CRM like this are small, so the maths is done in Java for readability;
 * for large tables these would become GROUP BY queries.
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private static final int TREND_MONTHS = 6;

    private final LeadRepository leads;
    private final TaskRepository tasks;
    private final UserRepository users;

    public AnalyticsService(LeadRepository leads, TaskRepository tasks, UserRepository users) {
        this.leads = leads;
        this.tasks = tasks;
        this.users = users;
    }

    public DashboardStats dashboard() {
        List<Lead> all = leads.findAll();
        long converted = all.stream().filter(l -> l.getStatus() == LeadStatus.CONVERTED).count();
        double pipeline = all.stream()
                .filter(l -> l.getStatus() != LeadStatus.CONVERTED && l.getStatus() != LeadStatus.LOST)
                .mapToDouble(Lead::getValue).sum();
        double won = all.stream().filter(l -> l.getStatus() == LeadStatus.CONVERTED)
                .mapToDouble(Lead::getValue).sum();
        double rate = all.isEmpty() ? 0 : Math.round(converted * 1000.0 / all.size()) / 10.0;

        List<Task> allTasks = tasks.findAll();
        long open = allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long overdue = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.OVERDUE).count();
        long activeUsers = users.findAll().stream().filter(u -> u.getStatus() == UserStatus.ACTIVE).count();

        return new DashboardStats(all.size(), converted, rate, pipeline, won, open, overdue, activeUsers);
    }

    /** Number of leads per source, biggest first. */
    public List<NameValue> leadSources() {
        return leads.findAll().stream()
                .collect(Collectors.groupingBy(
                        l -> l.getSource() == null || l.getSource().isBlank() ? "Unknown" : l.getSource(),
                        Collectors.counting()))
                .entrySet().stream()
                .map(e -> new NameValue(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(NameValue::value).reversed())
                .toList();
    }

    /** Last 6 months: leads created, leads converted and revenue won in each month. */
    public List<SalesTrendPoint> salesTrend() {
        List<Lead> all = leads.findAll();
        YearMonth current = YearMonth.now();
        return IntStream.rangeClosed(0, TREND_MONTHS - 1)
                .mapToObj(i -> current.minusMonths(TREND_MONTHS - 1 - i))
                .map(ym -> {
                    long created = all.stream().filter(l -> inMonth(l.getCreatedAt(), ym)).count();
                    List<Lead> won = all.stream()
                            .filter(l -> l.getStatus() == LeadStatus.CONVERTED && inMonth(l.getUpdatedAt(), ym))
                            .toList();
                    double revenue = won.stream().mapToDouble(Lead::getValue).sum();
                    return new SalesTrendPoint(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                            revenue, created, won.size());
                })
                .toList();
    }

    /** Top 5 reps by revenue from converted leads. */
    public List<LeaderboardEntry> leaderboard() {
        Map<String, User> byId = users.findAll().stream().collect(Collectors.toMap(User::getId, u -> u));
        Map<String, List<Lead>> wonByUser = leads.findAll().stream()
                .filter(l -> l.getStatus() == LeadStatus.CONVERTED && l.getAssignedTo() != null
                        && byId.containsKey(l.getAssignedTo()))
                .collect(Collectors.groupingBy(Lead::getAssignedTo));

        List<Map.Entry<String, List<Lead>>> sorted = wonByUser.entrySet().stream()
                .sorted((a, b) -> Double.compare(revenue(b.getValue()), revenue(a.getValue())))
                .limit(5)
                .toList();

        List<LeaderboardEntry> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            User u = byId.get(sorted.get(i).getKey());
            List<Lead> won = sorted.get(i).getValue();
            result.add(new LeaderboardEntry(i + 1, u.getId(), u.getName(), u.getAvatar(),
                    won.size(), revenue(won)));
        }
        return result;
    }

    private static double revenue(List<Lead> won) {
        return won.stream().mapToDouble(Lead::getValue).sum();
    }

    private static boolean inMonth(LocalDate date, YearMonth ym) {
        return date != null && YearMonth.from(date).equals(ym);
    }
}
