package com.harmony.crm.web;

import com.harmony.crm.dto.CreateUserRequest;
import com.harmony.crm.dto.UserResponse;
import com.harmony.crm.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** "Employees" in the UI. Anyone logged in can read; only admins can change. */
@Tag(name = "Employees")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> list() {
        return userService.list().stream().map(UserResponse::from).toList();
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable String id) {
        return UserResponse.from(userService.get(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return UserResponse.from(userService.create(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return UserResponse.from(userService.patch(id, body));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        userService.delete(id);
    }
}
