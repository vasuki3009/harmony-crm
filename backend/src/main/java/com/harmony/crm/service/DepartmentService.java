package com.harmony.crm.service;

import com.harmony.crm.domain.Department;
import com.harmony.crm.dto.DepartmentResponse;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.DepartmentRepository;
import com.harmony.crm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departments;
    private final UserRepository users;
    private final PatchHelper patcher;

    public DepartmentService(DepartmentRepository departments, UserRepository users, PatchHelper patcher) {
        this.departments = departments;
        this.users = users;
        this.patcher = patcher;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> list() {
        return departments.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse get(String id) {
        return toResponse(find(id));
    }

    public DepartmentResponse create(Department department) {
        department.setId(null);
        department.setCreatedAt(LocalDate.now());
        return toResponse(departments.save(department));
    }

    public DepartmentResponse patch(String id, Map<String, Object> body) {
        Department department = find(id);
        patcher.apply(department, body, "createdAt");
        return toResponse(departments.save(department));
    }

    public void delete(String id) {
        departments.delete(find(id));
    }

    private Department find(String id) {
        return departments.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department", id));
    }

    private DepartmentResponse toResponse(Department d) {
        return DepartmentResponse.of(d, users.countByDepartment(d.getName()));
    }
}
