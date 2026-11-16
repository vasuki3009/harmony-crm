package com.harmony.crm.dto;

import com.harmony.crm.domain.User;
import com.harmony.crm.enums.UserRole;
import com.harmony.crm.enums.UserStatus;

import java.time.LocalDate;

/** Public view of a user. It has no password field at all, so a hash can never leak by accident. */
public record UserResponse(
        String id,
        String name,
        String email,
        UserRole role,
        String department,
        String avatar,
        String phone,
        LocalDate joinDate,
        UserStatus status) {

    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getDepartment(),
                u.getAvatar(), u.getPhone(), u.getJoinDate(), u.getStatus());
    }
}
