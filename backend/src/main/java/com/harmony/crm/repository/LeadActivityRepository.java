package com.harmony.crm.repository;

import com.harmony.crm.domain.LeadActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadActivityRepository extends JpaRepository<LeadActivity, String> {
    List<LeadActivity> findByLeadIdOrderByCreatedAtDesc(String leadId);
    void deleteByLeadId(String leadId);
}
