package com.harmony.crm.repository;

import com.harmony.crm.domain.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByUserIdOrderByDateDesc(String userId);
    List<AttendanceRecord> findAllByOrderByDateDesc();
    Optional<AttendanceRecord> findByUserIdAndDate(String userId, LocalDate date);
}
