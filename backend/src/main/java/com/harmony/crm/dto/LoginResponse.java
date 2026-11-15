package com.harmony.crm.dto;

import com.harmony.crm.domain.User;

public record LoginResponse(String token, User user) {
}
