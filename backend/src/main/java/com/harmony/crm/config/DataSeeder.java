package com.harmony.crm.config;

import com.harmony.crm.domain.*;
import com.harmony.crm.enums.*;
import com.harmony.crm.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Fills an empty database with demo data (same people/leads/tasks as the old React mock data).
 * Dates are relative to "today" so the dashboard always looks current.
 * Every demo user has the password:  password
 * Turn off with SEED_DATA=false.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final DepartmentRepository departments;
    private final LeadRepository leads;
    private final LeadActivityRepository activities;
    private final TaskRepository tasks;
    private final GoalRepository goals;
    private final AttendanceRepository attendance;
    private final NotificationRepository notifications;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository users, DepartmentRepository departments, LeadRepository leads,
                      LeadActivityRepository activities, TaskRepository tasks, GoalRepository goals,
                      AttendanceRepository attendance, NotificationRepository notifications,
                      PasswordEncoder encoder) {
        this.users = users;
        this.departments = departments;
        this.leads = leads;
        this.activities = activities;
        this.tasks = tasks;
        this.goals = goals;
        this.attendance = attendance;
        this.notifications = notifications;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) {
            return;     // already seeded
        }
        seedUsers();
        seedDepartments();
        seedLeads();
        seedTasks();
        seedGoals();
        seedAttendance();
        seedNotifications();
    }

    private static LocalDate ago(int days) {
        return LocalDate.now().minusDays(days);
    }

    private static LocalDate in(int days) {
        return LocalDate.now().plusDays(days);
    }

    private void seedUsers() {
        String hash = encoder.encode("password");
        List<User> list = new ArrayList<>();
        list.add(user("u1", "Alex Carter", "alex", UserRole.ADMIN, "Executive", "AC", "+1 555-0100", 1400, UserStatus.ACTIVE, hash));
        list.add(user("u2", "Sarah Johnson", "sarah", UserRole.MANAGER, "Sales", "SJ", "+1 555-0101", 1300, UserStatus.ACTIVE, hash));
        list.add(user("u3", "Michael Chen", "michael", UserRole.EMPLOYEE, "Sales", "MC", "+1 555-0102", 1150, UserStatus.ACTIVE, hash));
        list.add(user("u4", "Emily Rodriguez", "emily", UserRole.EMPLOYEE, "Marketing", "ER", "+1 555-0103", 1050, UserStatus.ACTIVE, hash));
        list.add(user("u5", "James Wilson", "james", UserRole.EMPLOYEE, "Sales", "JW", "+1 555-0104", 900, UserStatus.ACTIVE, hash));
        list.add(user("u6", "Priya Patel", "priya", UserRole.MANAGER, "Marketing", "PP", "+1 555-0105", 1250, UserStatus.ACTIVE, hash));
        list.add(user("u7", "David Kim", "david", UserRole.EMPLOYEE, "Support", "DK", "+1 555-0106", 800, UserStatus.ACTIVE, hash));
        list.add(user("u8", "Lisa Thompson", "lisa", UserRole.EMPLOYEE, "Marketing", "LT", "+1 555-0107", 700, UserStatus.INACTIVE, hash));
        users.saveAll(list);
    }

    private User user(String id, String name, String emailName, UserRole role, String dept, String avatar,
                      String phone, int joinedDaysAgo, UserStatus status, String hash) {
        User u = User.builder().name(name).email(emailName + "@nexuscrm.io").passwordHash(hash)
                .role(role).department(dept).avatar(avatar).phone(phone)
                .joinDate(ago(joinedDaysAgo)).status(status).build();
        u.setId(id);
        return u;
    }

    private void seedDepartments() {
        departments.saveAll(List.of(
                dept("d1", "Sales", "u2", "Revenue generation and client acquisition"),
                dept("d2", "Marketing", "u6", "Brand management and lead generation"),
                dept("d3", "Support", "u7", "Customer success and technical support"),
                dept("d4", "Engineering", "u1", "Product development and infrastructure"),
                dept("d5", "Executive", "u1", "Leadership and strategy")));
    }

    private Department dept(String id, String name, String headId, String description) {
        Department d = Department.builder().name(name).headId(headId).description(description)
                .createdAt(ago(1500)).build();
        d.setId(id);
        return d;
    }

    private void seedLeads() {
        List<Lead> list = List.of(
                lead("l1", "TechCorp Solutions", "contact@techcorp.com", "+1 555-2001", LeadStatus.QUALIFIED, LeadTemperature.HOT, 92, "u3", 45000, "Website", "Very interested in Enterprise plan", 12, 2, 3, "enterprise", "tech"),
                lead("l2", "Global Retail Inc", "info@globalretail.com", "+1 555-2002", LeadStatus.CONTACTED, LeadTemperature.WARM, 68, "u5", 28000, "LinkedIn", "Follow up next week", 10, 4, 4, "retail", "smb"),
                lead("l3", "StartupHub", "hello@startuphub.io", "+1 555-2003", LeadStatus.NEW, LeadTemperature.COLD, 35, "u4", 8000, "Cold Email", "", 7, 7, -1, "startup"),
                lead("l4", "Meridian Finance", "sales@meridian.com", "+1 555-2004", LeadStatus.CONVERTED, LeadTemperature.HOT, 98, "u3", 120000, "Referral", "Closed deal", 50, 3, 3, "finance", "enterprise"),
                lead("l5", "BlueSky Media", "contact@bluesky.media", "+1 555-2005", LeadStatus.QUALIFIED, LeadTemperature.WARM, 74, "u5", 22000, "Trade Show", "Budget approved Q1", 40, 5, 6, "media", "smb"),
                lead("l6", "NovaTech Labs", "bd@novatech.io", "+1 555-2006", LeadStatus.LOST, LeadTemperature.COLD, 20, "u3", 15000, "Website", "Went with competitor", 60, 12, -1, "tech"),
                lead("l7", "Apex Consulting", "info@apexco.com", "+1 555-2007", LeadStatus.CONTACTED, LeadTemperature.HOT, 85, "u2", 55000, "LinkedIn", "Needs demo this week", 8, 1, 1, "consulting", "enterprise"),
                lead("l8", "Skyline Properties", "cto@skyline.re", "+1 555-2008", LeadStatus.NEW, LeadTemperature.WARM, 55, "u4", 18000, "Event", "", 3, 3, -1, "realestate"),
                lead("l9", "Orbit Logistics", "ops@orbitlog.com", "+1 555-2009", LeadStatus.CONVERTED, LeadTemperature.HOT, 90, "u2", 72000, "Referral", "Annual contract signed", 75, 35, 35, "logistics"),
                lead("l10", "Lumen Health", "hello@lumenhealth.io", "+1 555-2010", LeadStatus.CONVERTED, LeadTemperature.WARM, 81, "u5", 34000, "Website", "Onboarded last month", 95, 65, 65, "health", "smb"),
                lead("l11", "Quantum Edge", "bd@quantumedge.ai", "+1 555-2011", LeadStatus.CONVERTED, LeadTemperature.HOT, 94, "u3", 98000, "LinkedIn", "Multi-year deal", 120, 95, 95, "ai", "enterprise"));
        leads.saveAll(list);

        List<LeadActivity> acts = List.of(
                activity("la1", "l1", ActivityType.CALL, "Initial discovery call — 30 min. Discussed pain points.", "u3", 11),
                activity("la2", "l1", ActivityType.EMAIL, "Sent proposal deck and pricing sheet.", "u3", 9),
                activity("la3", "l1", ActivityType.STATUS_CHANGE, "Status changed: Contacted → Qualified", "u3", 6),
                activity("la4", "l1", ActivityType.NOTE, "Very interested in the Enterprise plan. Budget ~$45k confirmed.", "u2", 3),
                activity("la5", "l4", ActivityType.STATUS_CHANGE, "Status changed: Qualified → Converted", "u3", 3));
        activities.saveAll(acts);
    }

    /** createdDaysAgo / updatedDaysAgo / lastContactDaysAgo (-1 = never contacted). */
    private Lead lead(String id, String name, String email, String phone, LeadStatus status, LeadTemperature temp,
                      int score, String assignedTo, double value, String source, String notes,
                      int createdDaysAgo, int updatedDaysAgo, int lastContactDaysAgo, String... tags) {
        Lead l = Lead.builder().name(name).email(email).phone(phone).company(name).status(status)
                .temperature(temp).score(score).assignedTo(assignedTo).value(value).source(source)
                .notes(notes).createdAt(ago(createdDaysAgo)).updatedAt(ago(updatedDaysAgo))
                .lastContact(lastContactDaysAgo < 0 ? null : ago(lastContactDaysAgo))
                .tags(new ArrayList<>(List.of(tags))).build();
        l.setId(id);
        return l;
    }

    private LeadActivity activity(String id, String leadId, ActivityType type, String text, String by, int daysAgo) {
        LeadActivity a = LeadActivity.builder().leadId(leadId).type(type).description(text).performedBy(by)
                .createdAt(LocalDateTime.now().minusDays(daysAgo)).build();
        a.setId(id);
        return a;
    }

    private void seedTasks() {
        tasks.saveAll(List.of(
                task("t1", "Follow up with TechCorp Solutions", "Schedule demo meeting and send product overview", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, "u3", "u2", in(3), null, "l1", 3, "lead", "demo"),
                task("t2", "Prepare Q1 Sales Report", "Compile all lead conversions and revenue data for Q1", TaskStatus.PENDING, TaskPriority.MEDIUM, "u2", "u1", in(10), null, null, 1, "report", "sales"),
                task("t3", "Update CRM documentation", "Document new lead qualification process", TaskStatus.COMPLETED, TaskPriority.LOW, "u4", "u6", ago(2), ago(3), null, 0, "docs"),
                task("t4", "Cold call campaign — 50 leads", "Call all cold leads in database and update status", TaskStatus.PENDING, TaskPriority.HIGH, "u5", "u2", in(1), null, null, 2, "calls", "leads"),
                task("t5", "Product demo for Apex Consulting", "Prepare and deliver live demo for Apex team", TaskStatus.PENDING, TaskPriority.CRITICAL, "u2", "u1", in(1), null, "l7", 5, "demo", "enterprise"),
                task("t6", "Onboard new sales team members", "CRM training for 3 new hires joining next month", TaskStatus.PENDING, TaskPriority.MEDIUM, "u2", "u1", in(14), null, null, 0, "hr", "training"),
                task("t7", "Set up email automation for leads", "Configure drip campaign in marketing tool", TaskStatus.OVERDUE, TaskPriority.HIGH, "u4", "u6", ago(5), null, null, 4, "automation", "email"),
                task("t8", "Monthly support tickets review", "Analyze top support issues and create FAQ", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, "u7", "u1", in(8), null, null, 1, "support")));
    }

    private Task task(String id, String title, String description, TaskStatus status, TaskPriority priority,
                      String assignedTo, String createdBy, LocalDate due, LocalDate completedAt,
                      String leadId, int comments, String... tags) {
        Task t = Task.builder().title(title).description(description).status(status).priority(priority)
                .assignedTo(assignedTo).createdBy(createdBy).dueDate(due).completedAt(completedAt)
                .leadId(leadId).comments(comments).tags(new ArrayList<>(List.of(tags))).build();
        t.setId(id);
        return t;
    }

    private void seedGoals() {
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        goals.saveAll(List.of(
                goal("g1", "u3", "Convert Leads", 10, 7, "leads", endOfMonth),
                goal("g2", "u3", "Revenue Target", 150000, 98000, "$", endOfMonth),
                goal("g3", "u5", "New Leads", 20, 14, "leads", endOfMonth),
                goal("g4", "u5", "Calls Made", 100, 67, "calls", endOfMonth),
                goal("g5", "u2", "Team Revenue", 500000, 312000, "$", endOfMonth),
                goal("g6", "u4", "MQLs Generated", 40, 28, "leads", endOfMonth)));
    }

    private Goal goal(String id, String userId, String title, double target, double current, String unit, LocalDate due) {
        Goal g = Goal.builder().userId(userId).title(title).target(target).current(current).unit(unit)
                .period(GoalPeriod.MONTHLY).dueDate(due).build();
        g.setId(id);
        return g;
    }

    private void seedAttendance() {
        attendance.saveAll(List.of(
                att("a1", "u3", 2, "09:02", "17:45", AttendanceStatus.PRESENT, 8.7),
                att("a2", "u3", 3, "09:30", "18:00", AttendanceStatus.LATE, 8.5),
                att("a3", "u3", 4, "08:55", "17:00", AttendanceStatus.PRESENT, 8.1),
                att("a4", "u5", 2, "09:00", "17:30", AttendanceStatus.PRESENT, 8.5),
                att("a5", "u4", 2, null, null, AttendanceStatus.ABSENT, null)));
    }

    private AttendanceRecord att(String id, String userId, int daysAgo, String in, String out,
                                 AttendanceStatus status, Double hours) {
        AttendanceRecord r = AttendanceRecord.builder().userId(userId).date(ago(daysAgo))
                .checkIn(in == null ? null : LocalTime.parse(in))
                .checkOut(out == null ? null : LocalTime.parse(out))
                .status(status).hoursWorked(hours).build();
        r.setId(id);
        return r;
    }

    private void seedNotifications() {
        notifications.saveAll(List.of(
                note("n1", "u2", "New lead assigned", "Skyline Properties has been assigned to your team", NotificationType.LEAD, false, 0),
                note("n2", "u2", "Task deadline approaching", "\"Product demo for Apex Consulting\" is due tomorrow", NotificationType.TASK, false, 2),
                note("n3", "u2", "Leave request", "Michael Chen requested 2 days leave", NotificationType.APPROVAL, true, 3),
                note("n4", "u2", "Lead converted!", "Meridian Finance has been converted — $120,000 deal", NotificationType.LEAD, true, 4)));
    }

    private Notification note(String id, String userId, String title, String message, NotificationType type,
                              boolean read, int daysAgo) {
        Notification n = Notification.builder().userId(userId).title(title).message(message).type(type)
                .read(read).createdAt(LocalDateTime.now().minusDays(daysAgo)).build();
        n.setId(id);
        return n;
    }
}
