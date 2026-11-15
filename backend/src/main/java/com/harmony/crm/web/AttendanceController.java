package com.harmony.crm.web;

import com.harmony.crm.domain.AttendanceRecord;
import com.harmony.crm.service.AttendanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Attendance")
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<AttendanceRecord> list(@RequestParam(required = false) String userId) {
        return attendanceService.list(userId);
    }

    @PostMapping("/check-in")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceRecord checkIn() {
        return attendanceService.checkIn();
    }

    @PostMapping("/check-out")
    public AttendanceRecord checkOut() {
        return attendanceService.checkOut();
    }
}
