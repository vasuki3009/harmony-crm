package com.harmony.crm.web;

import com.harmony.crm.dto.LoginRequest;
import com.harmony.crm.dto.LoginResponse;
import com.harmony.crm.dto.UserResponse;
import com.harmony.crm.service.AuthService;
import com.harmony.crm.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** The currently logged-in user (used by the frontend to restore a session). */
    @GetMapping("/me")
    public UserResponse me() {
        return UserResponse.from(userService.currentUser());
    }
}
