package com.harmony.crm.service;

import com.harmony.crm.domain.Goal;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.GoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class GoalService {

    private final GoalRepository goals;
    private final PatchHelper patcher;

    public GoalService(GoalRepository goals, PatchHelper patcher) {
        this.goals = goals;
        this.patcher = patcher;
    }

    @Transactional(readOnly = true)
    public List<Goal> list(String userId) {
        return (userId == null || userId.isBlank()) ? goals.findAll() : goals.findByUserId(userId);
    }

    public Goal create(Goal goal) {
        goal.setId(null);
        return goals.save(goal);
    }

    public Goal patch(String id, Map<String, Object> body) {
        Goal goal = goals.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal", id));
        patcher.apply(goal, body);
        return goals.save(goal);
    }

    public void delete(String id) {
        goals.delete(goals.findById(id).orElseThrow(() -> new ResourceNotFoundException("Goal", id)));
    }
}
