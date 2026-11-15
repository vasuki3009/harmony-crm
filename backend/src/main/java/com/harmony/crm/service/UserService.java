package com.harmony.crm.service;

import com.harmony.crm.domain.User;
import com.harmony.crm.dto.CreateUserRequest;
import com.harmony.crm.exception.BadRequestException;
import com.harmony.crm.exception.ResourceNotFoundException;
import com.harmony.crm.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final PatchHelper patcher;

    public UserService(UserRepository users, PasswordEncoder encoder, PatchHelper patcher) {
        this.users = users;
        this.encoder = encoder;
        this.patcher = patcher;
    }

    @Transactional(readOnly = true)
    public List<User> list() {
        return users.findAll();
    }

    @Transactional(readOnly = true)
    public User get(String id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    /** The logged-in user, resolved from the JWT (the Authentication name is the email). */
    @Transactional(readOnly = true)
    public User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new BadRequestException("No authenticated user");
        }
        return users.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", auth.getName()));
    }

    public User create(CreateUserRequest req) {
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw new BadRequestException("A user with this email already exists");
        }
        User user = User.builder()
                .name(req.name())
                .email(req.email().toLowerCase())
                .passwordHash(encoder.encode(req.password()))
                .department(req.department())
                .phone(req.phone())
                .avatar(initials(req.name()))
                .joinDate(LocalDate.now())
                .build();
        if (req.role() != null) {
            user.setRole(req.role());
        }
        return users.save(user);
    }

    public User patch(String id, Map<String, Object> body) {
        User user = get(id);
        String oldEmail = user.getEmail();
        patcher.apply(user, body);
        if (!oldEmail.equalsIgnoreCase(user.getEmail()) && users.existsByEmailIgnoreCase(user.getEmail())) {
            throw new BadRequestException("A user with this email already exists");
        }
        return users.save(user);
    }

    public void delete(String id) {
        User target = get(id);
        if (target.getEmail().equalsIgnoreCase(currentUser().getEmail())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        users.delete(target);
    }

    private static String initials(String name) {
        return Arrays.stream(name.trim().split("\\s+"))
                .filter(p -> !p.isEmpty())
                .limit(2)
                .map(p -> p.substring(0, 1).toUpperCase())
                .collect(Collectors.joining());
    }
}
