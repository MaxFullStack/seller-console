import { useMemo } from "react";
import { useDashboardStore } from "@/store/dashboard-store";

/**
 * Hook for Lead-specific Metrics
 *
 * Responsibilities:
 * - Calculate lead distribution by status
 * - Calculate average lead score
 * - Calculate lead conversion rate
 *
 * @returns Lead metrics derived from raw store data
 */
export const useLeadsMetrics = () => {
  const leads = useDashboardStore((state) => state.leads);

  return useMemo(() => {
    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "new").length;
    const qualifiedLeads = leads.filter(
      (lead) => lead.status === "qualified",
    ).length;
    const unqualifiedLeads = leads.filter(
      (lead) => lead.status === "unqualified",
    ).length;
    const contactedLeads = leads.filter(
      (lead) => lead.status === "contacted",
    ).length;

    const averageLeadScore =
      totalLeads > 0
        ? Math.round(
            leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads,
          )
        : 0;

    const conversionRate =
      totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      unqualifiedLeads,
      contactedLeads,
      averageLeadScore,
      conversionRate,
    };
  }, [leads]);
};
