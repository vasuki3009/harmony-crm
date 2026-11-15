package com.harmony.crm.repository;

import com.harmony.crm.domain.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TaskRepository extends JpaRepository<Task, String>, JpaSpecificationExecutor<Task> {
}
