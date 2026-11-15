package com.harmony.crm.service;

import com.harmony.crm.domain.User;
import com.harmony.crm.dto.LoginRequest;
import com.harmony.crm.dto.LoginResponse;
import com.harmony.crm.repository.UserRepository;
import com.harmony.crm.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository users, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.jwtService = jwtService;
    }

    /** Throws BadCredentialsException / DisabledException (-> 401) when the login is wrong. */
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim(), request.password()));
        User user = users.findByEmailIgnoreCase(request.email().trim()).orElseThrow();
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user);
    }
}
