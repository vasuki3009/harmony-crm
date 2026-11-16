package com.harmony.crm.web;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end tests of the REST API against the in-memory H2 database and the seeded demo data.
 * Every request goes through the real security filter chain (JWT).
 */
@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    @Autowired
    MockMvc mvc;

    private static final String NEW_LEAD = """
            {"name":"Test Company","email":"hello@test.com","phone":"+1 555-0000","company":"Test Company",
             "status":"new","temperature":"warm","score":50,"assignedTo":"u3","value":1000,
             "source":"Website","notes":"","tags":["test"]}
            """;

    /** Logs in with the demo password and returns "Bearer <jwt>". */
    private String bearer(String email) throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.token");
    }

    private String createLead(String auth) throws Exception {
        String body = mvc.perform(post("/api/leads").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_LEAD))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.id");
    }

    // ---------- auth ----------

    @Test
    void loginReturnsTokenAndUserWithoutPasswordHash() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"sarah@harmonycrm.io\",\"password\":\"password\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.user.email").value("sarah@harmonycrm.io"))
                .andExpect(jsonPath("$.user.role").value("manager"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    void wrongPasswordIsRejectedWith401() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"sarah@harmonycrm.io\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inactiveUserCannotLogIn() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"lisa@harmonycrm.io\",\"password\":\"password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithoutTokenReturns401() throws Exception {
        mvc.perform(get("/api/leads")).andExpect(status().isUnauthorized());
    }

    @Test
    void meReturnsTheLoggedInUser() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", bearer("alex@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alex Carter"))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    // ---------- leads ----------

    @Test
    void seededLeadsAreReturnedAndCanBeFilteredByStatus() throws Exception {
        String auth = bearer("sarah@harmonycrm.io");
        mvc.perform(get("/api/leads").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(8)));
        mvc.perform(get("/api/leads").param("status", "converted").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$[*].status", everyItem(is("converted"))));
    }

    @Test
    void searchMatchesCompanyName() throws Exception {
        mvc.perform(get("/api/leads").param("q", "techcorp")
                        .header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("TechCorp Solutions"));
    }

    @Test
    void createLeadReturns201WithGeneratedIdAndDates() throws Exception {
        mvc.perform(post("/api/leads").header("Authorization", bearer("michael@harmonycrm.io"))
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_LEAD))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", not(emptyString())))
                .andExpect(jsonPath("$.status").value("new"))
                .andExpect(jsonPath("$.createdAt", not(emptyString())))
                .andExpect(jsonPath("$.tags[0]").value("test"));
    }

    @Test
    void createLeadWithoutNameFailsValidation() throws Exception {
        mvc.perform(post("/api/leads").header("Authorization", bearer("michael@harmonycrm.io"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"a@b.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.name").exists());
    }

    @Test
    void changingStatusIsWrittenToTheActivityTimeline() throws Exception {
        String auth = bearer("michael@harmonycrm.io");
        String id = createLead(auth);

        mvc.perform(patch("/api/leads/" + id).header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"contacted\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("contacted"));

        mvc.perform(get("/api/leads/" + id + "/activities").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type=='status_change')]", not(empty())));
    }

    @Test
    void unknownLeadReturns404() throws Exception {
        mvc.perform(get("/api/leads/does-not-exist").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isNotFound());
    }

    @Test
    void employeeCannotDeleteLeadButManagerCan() throws Exception {
        String employee = bearer("michael@harmonycrm.io");
        String manager = bearer("sarah@harmonycrm.io");
        String id = createLead(employee);

        mvc.perform(delete("/api/leads/" + id).header("Authorization", employee))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/leads/" + id).header("Authorization", manager))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/leads/" + id).header("Authorization", manager))
                .andExpect(status().isNotFound());
    }

    @Test
    void leadsCanBePagedAndTotalsAreInHeaders() throws Exception {
        mvc.perform(get("/api/leads").param("page", "0").param("size", "3")
                        .header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(header().string("X-Total-Pages", not(emptyString())))
                .andExpect(header().string("X-Total-Count", not(emptyString())));
    }

    @Test
    void leadsCanBeSortedByValueDescending() throws Exception {
        mvc.perform(get("/api/leads").param("page", "0").param("size", "1").param("sort", "value,desc")
                        .header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value(120000.0));
    }

    @Test
    void sortingByANonWhitelistedFieldIsRejected() throws Exception {
        mvc.perform(get("/api/leads").param("sort", "assignedTo;drop,desc")
                        .header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pageSizeAboveTheLimitIsRejected() throws Exception {
        mvc.perform(get("/api/leads").param("page", "0").param("size", "1000")
                        .header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void leadResponsesUseTheDtoShape() throws Exception {
        mvc.perform(get("/api/leads/l1").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("l1"))
                .andExpect(jsonPath("$.value").value(45000.0))
                .andExpect(jsonPath("$.tags", hasItem("enterprise")))
                .andExpect(jsonPath("$.status").value("qualified"));
    }

    // ---------- tasks ----------

    @Test
    void completingATaskStampsCompletedAt() throws Exception {
        String auth = bearer("sarah@harmonycrm.io");
        String body = mvc.perform(post("/api/tasks").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Write proposal\",\"assignedTo\":\"u3\",\"priority\":\"high\",\"dueDate\":\"2030-01-01\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("pending"))
                .andExpect(jsonPath("$.createdBy").value("u2"))
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(body, "$.id");

        mvc.perform(patch("/api/tasks/" + id).header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"completed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedAt", not(emptyString())));
    }

    @Test
    void invalidStatusValueIsRejectedWith400() throws Exception {
        mvc.perform(get("/api/tasks").param("status", "nonsense")
                        .header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isBadRequest());
    }

    // ---------- employees, departments, analytics, attendance ----------

    @Test
    void onlyAdminCanCreateEmployees() throws Exception {
        String user = "{\"name\":\"New Hire\",\"email\":\"new.hire@harmonycrm.io\",\"password\":\"secret123\",\"role\":\"employee\",\"department\":\"Sales\"}";
        mvc.perform(post("/api/users").header("Authorization", bearer("sarah@harmonycrm.io"))
                        .contentType(MediaType.APPLICATION_JSON).content(user))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/users").header("Authorization", bearer("alex@harmonycrm.io"))
                        .contentType(MediaType.APPLICATION_JSON).content(user))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.avatar").value("NH"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void departmentsIncludeLiveEmployeeCount() throws Exception {
        mvc.perform(get("/api/departments").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name=='Sales')].employeeCount", contains(greaterThanOrEqualTo(3))));
    }

    @Test
    void dashboardAnalyticsAreCalculatedFromRealData() throws Exception {
        mvc.perform(get("/api/analytics/dashboard").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLeads", greaterThanOrEqualTo(8)))
                .andExpect(jsonPath("$.convertedLeads", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.wonRevenue", greaterThan(0.0)));
        mvc.perform(get("/api/analytics/sales-trend").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));
        mvc.perform(get("/api/analytics/leaderboard").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rank").value(1));
    }

    @Test
    void checkInTwiceInOneDayIsRejected() throws Exception {
        String auth = bearer("james@harmonycrm.io");
        mvc.perform(post("/api/attendance/check-in").header("Authorization", auth))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/attendance/check-in").header("Authorization", auth))
                .andExpect(status().isBadRequest());
    }

    @Test
    void usersOnlySeeTheirOwnNotifications() throws Exception {
        mvc.perform(get("/api/notifications").header("Authorization", bearer("sarah@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(4)));
        mvc.perform(get("/api/notifications").header("Authorization", bearer("david@harmonycrm.io")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
