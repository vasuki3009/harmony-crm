package com.harmony.crm.dto;

/** Small response records used by the analytics endpoints. */
public final class AnalyticsDtos {

    private AnalyticsDtos() {
    }

    public record DashboardStats(long totalLeads, long convertedLeads, double conversionRate,
                                 double pipelineValue, double wonRevenue,
                                 long openTasks, long overdueTasks, long activeEmployees) {
    }

    public record NameValue(String name, long value) {
    }

    public record SalesTrendPoint(String month, double revenue, long leads, long converted) {
    }

    public record LeaderboardEntry(int rank, String userId, String name, String avatar,
                                   long converted, double revenue) {
    }
}
