package com.harmony.crm.web;

import com.harmony.crm.dto.AnalyticsDtos.DashboardStats;
import com.harmony.crm.dto.AnalyticsDtos.LeaderboardEntry;
import com.harmony.crm.dto.AnalyticsDtos.NameValue;
import com.harmony.crm.dto.AnalyticsDtos.SalesTrendPoint;
import com.harmony.crm.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Analytics")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analytics;

    public AnalyticsController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @GetMapping("/dashboard")
    public DashboardStats dashboard() {
        return analytics.dashboard();
    }

    @GetMapping("/lead-sources")
    public List<NameValue> leadSources() {
        return analytics.leadSources();
    }

    @GetMapping("/sales-trend")
    public List<SalesTrendPoint> salesTrend() {
        return analytics.salesTrend();
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntry> leaderboard() {
        return analytics.leaderboard();
    }
}
