package com.harmony.crm.web;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Runs the app on a real PostgreSQL database with the "prod" profile, so the Flyway migration
 * (db/migration/V1__init_schema.sql) is checked against the entities: seeding, queries, filtering.
 *
 * Skipped on a normal "mvn test". The GitHub Actions job "Backend on PostgreSQL" enables it
 * (RUN_POSTGRES_TESTS=true) and provides the database through DB_URL / DB_USERNAME / DB_PASSWORD.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
@EnabledIfEnvironmentVariable(named = "RUN_POSTGRES_TESTS", matches = "true")
class PostgresIntegrationTest {

    @Autowired
    MockMvc mvc;

    private String bearer() throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"sarah@harmonycrm.io\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.token");
    }

    @Test
    void migratedSchemaWorksEndToEnd() throws Exception {
        String auth = bearer();

        mvc.perform(get("/api/leads").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(8)));

        String created = mvc.perform(post("/api/leads").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Postgres Co\",\"email\":\"pg@test.com\",\"value\":2500,\"tags\":[\"pg\",\"flyway\"]}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(created, "$.id");

        mvc.perform(patch("/api/leads/" + id).header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"qualified\"}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/leads/" + id + "/activities").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(2)));

        mvc.perform(get("/api/leads").param("status", "qualified").param("q", "postgres")
                        .param("page", "0").param("size", "5").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Postgres Co"));

        mvc.perform(get("/api/tasks").header("Authorization", auth)).andExpect(status().isOk());
        mvc.perform(get("/api/analytics/dashboard").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLeads", greaterThanOrEqualTo(9)));
        mvc.perform(get("/api/analytics/sales-trend").header("Authorization", auth)).andExpect(status().isOk());
        mvc.perform(get("/api/attendance").header("Authorization", auth)).andExpect(status().isOk());
        mvc.perform(get("/api/notifications").header("Authorization", auth)).andExpect(status().isOk());
    }
}
