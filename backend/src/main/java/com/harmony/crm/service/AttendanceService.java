package com.harmony.crm.service;

import com.harmony.crm.domain.AttendanceRecord;
import com.harmony.crm.domain.User;
import com.harmony.crm.enums.AttendanceStatus;
import com.harmony.crm.exception.BadRequestException;
import com.harmony.crm.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class AttendanceService {

    private static final LocalTime LATE_AFTER = LocalTime.of(9, 15);
    private static final double HALF_DAY_HOURS = 4.0;

    private final AttendanceRepository attendance;
    private final UserService userService;

    public AttendanceService(AttendanceRepository attendance, UserService userService) {
        this.attendance = attendance;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecord> list(String userId) {
        return (userId == null || userId.isBlank())
                ? attendance.findAllByOrderByDateDesc()
                : attendance.findByUserIdOrderByDateDesc(userId);
    }

    public AttendanceRecord checkIn() {
        User user = userService.currentUser();
        LocalDate today = LocalDate.now();
        if (attendance.findByUserIdAndDate(user.getId(), today).isPresent()) {
            throw new BadRequestException("You have already checked in today");
        }
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        AttendanceRecord record = AttendanceRecord.builder()
                .userId(user.getId())
                .date(today)
                .checkIn(now)
                .status(now.isAfter(LATE_AFTER) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT)
                .build();
        return attendance.save(record);
    }

    public AttendanceRecord checkOut() {
        User user = userService.currentUser();
        AttendanceRecord record = attendance.findByUserIdAndDate(user.getId(), LocalDate.now())
                .orElseThrow(() -> new BadRequestException("You have not checked in today"));
        if (record.getCheckOut() != null) {
            throw new BadRequestException("You have already checked out today");
        }
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        record.setCheckOut(now);
        double hours = Math.max(0, Duration.between(record.getCheckIn(), now).toMinutes() / 60.0);
        record.setHoursWorked(Math.round(hours * 10) / 10.0);
        if (hours < HALF_DAY_HOURS) {
            record.setStatus(AttendanceStatus.HALF_DAY);
        }
        return attendance.save(record);
    }
}
