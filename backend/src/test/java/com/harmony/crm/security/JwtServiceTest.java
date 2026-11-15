package com.harmony.crm.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "MT3wC0Cs8sX7yvI+GCfPdSWpJmeVx4OHP6utmoujFYqeKVaovmvJJUtFWGTD07sF";

    @Test
    void validTokenReturnsTheEmailItWasIssuedFor() {
        JwtService jwt = new JwtService(SECRET, 60);
        String token = jwt.generateToken("sarah@nexuscrm.io", "MANAGER");
        assertEquals("sarah@nexuscrm.io", jwt.validateAndGetEmail(token).orElseThrow());
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtService jwt = new JwtService(SECRET, 60);
        String token = jwt.generateToken("sarah@nexuscrm.io", "MANAGER");
        String tampered = token.substring(0, token.length() - 3) + "abc";
        assertTrue(jwt.validateAndGetEmail(tampered).isEmpty());
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService jwt = new JwtService(SECRET, -1);   // already expired when issued
        String token = jwt.generateToken("sarah@nexuscrm.io", "MANAGER");
        assertTrue(jwt.validateAndGetEmail(token).isEmpty());
    }

    @Test
    void garbageIsRejected() {
        JwtService jwt = new JwtService(SECRET, 60);
        assertTrue(jwt.validateAndGetEmail("not-a-jwt").isEmpty());
    }
}
