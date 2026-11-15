package com.harmony.crm.repository;

import com.harmony.crm.domain.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LeadRepository extends JpaRepository<Lead, String>, JpaSpecificationExecutor<Lead> {
}
