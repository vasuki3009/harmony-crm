package com.harmony.crm.repository;

import com.harmony.crm.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, String> {
    List<Goal> findByUserId(String userId);
}
