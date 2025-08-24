import { useMemo } from "react";
import { useDashboardStore } from "@/store/dashboard-store";
import { useLeadsMetrics } from "./use-leads-metrics";
import { useOpportunitiesMetrics } from "./use-opportunities-metrics";

/**
 * Hook for Overall Dashboard Metrics
 *
 * Responsibilities:
 * - Combine leads and opportunities metrics
 * - Calculate cross-domain metrics (e.g., revenue per lead)
 * - Provide last updated timestamp
 *
 * @returns Combined metrics from all sources
 */
export const useOverallMetrics = () => {
  const leadsMetrics = useLeadsMetrics();
  const opportunitiesMetrics = useOpportunitiesMetrics();
  const lastUpdated = useDashboardStore((state) => state.lastUpdated);

  return useMemo(() => {
    // Cross-domain calculations
    const revenuePerLead =
      leadsMetrics.totalLeads > 0
        ? opportunitiesMetrics.totalRevenue / leadsMetrics.totalLeads
        : 0;

    return {
      // Individual domain metrics
      leads: leadsMetrics,
      opportunities: opportunitiesMetrics,

      // Cross-domain metrics
      revenuePerLead,

      // Meta information
      lastUpdated,

      // Legacy format for backward compatibility (can be removed later)
      metrics: {
        ...leadsMetrics,
        ...opportunitiesMetrics,
      },
    };
  }, [leadsMetrics, opportunitiesMetrics, lastUpdated]);
};
