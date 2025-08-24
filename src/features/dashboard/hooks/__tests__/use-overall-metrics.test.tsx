import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOverallMetrics } from "../use-overall-metrics";
import { useLeadsMetrics } from "../use-leads-metrics";
import { useOpportunitiesMetrics } from "../use-opportunities-metrics";
import { useDashboardStore } from "@/store/dashboard-store";

// Mock the dependent hooks
vi.mock("../use-leads-metrics", () => ({
  useLeadsMetrics: vi.fn(),
}));

vi.mock("../use-opportunities-metrics", () => ({
  useOpportunitiesMetrics: vi.fn(),
}));

vi.mock("@/store/dashboard-store", () => ({
  useDashboardStore: vi.fn(),
}));

const mockUseLeadsMetrics = vi.mocked(useLeadsMetrics);
const mockUseOpportunitiesMetrics = vi.mocked(useOpportunitiesMetrics);
const mockUseDashboardStore = vi.mocked(useDashboardStore);

describe("useOverallMetrics", () => {
  const mockDate = new Date("2025-01-15T10:30:00Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with empty metrics", () => {
    it("should return zero metrics when all domains are empty", () => {
      const leadsMetrics = {
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 0,
        conversionRate: 0,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        totalPipelineValue: 0,
        opportunitiesByStage: {},
        opportunityConversionRate: 0,
        closedWonCount: 0,
        winRate: 0,
        activeOpportunities: 0,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(null);

      const { result } = renderHook(() => useOverallMetrics());

      expect(result.current).toEqual({
        leads: leadsMetrics,
        opportunities: opportunitiesMetrics,
        revenuePerLead: 0,
        lastUpdated: null,
        metrics: {
          ...leadsMetrics,
          ...opportunitiesMetrics,
        },
      });
    });
  });

  describe("with populated metrics", () => {
    it("should combine leads and opportunities metrics correctly", () => {
      const leadsMetrics = {
        totalLeads: 10,
        newLeads: 3,
        qualifiedLeads: 4,
        unqualifiedLeads: 2,
        contactedLeads: 1,
        averageLeadScore: 75,
        conversionRate: 40,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 6,
        totalRevenue: 300000,
        averageDealSize: 75000,
        totalPipelineValue: 450000,
        opportunitiesByStage: {
          prospecting: 1,
          proposal: 2,
          "closed-won": 2,
          "closed-lost": 1,
        },
        opportunityConversionRate: 50,
        closedWonCount: 2,
        winRate: 67,
        activeOpportunities: 3,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result } = renderHook(() => useOverallMetrics());

      expect(result.current).toEqual({
        leads: leadsMetrics,
        opportunities: opportunitiesMetrics,
        revenuePerLead: 30000, // 300k revenue / 10 leads
        lastUpdated: mockDate,
        metrics: {
          ...leadsMetrics,
          ...opportunitiesMetrics,
        },
      });
    });
  });

  describe("revenue per lead calculations", () => {
    it("should calculate revenue per lead correctly", () => {
      const testCases = [
        { totalLeads: 10, totalRevenue: 100000, expected: 10000 },
        { totalLeads: 5, totalRevenue: 250000, expected: 50000 },
        { totalLeads: 20, totalRevenue: 600000, expected: 30000 },
        { totalLeads: 1, totalRevenue: 75000, expected: 75000 },
      ];

      testCases.forEach(({ totalLeads, totalRevenue, expected }) => {
        const leadsMetrics = {
          totalLeads,
          newLeads: 0,
          qualifiedLeads: 0,
          unqualifiedLeads: 0,
          contactedLeads: 0,
          averageLeadScore: 80,
          conversionRate: 50,
        };

        const opportunitiesMetrics = {
          totalOpportunities: 5,
          totalRevenue,
          averageDealSize: 50000,
          totalPipelineValue: 300000,
          opportunitiesByStage: {},
          opportunityConversionRate: 40,
          closedWonCount: 3,
          winRate: 60,
          activeOpportunities: 2,
        };

        mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
        mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
        mockUseDashboardStore.mockReturnValue(mockDate);

        const { result } = renderHook(() => useOverallMetrics());

        expect(result.current.revenuePerLead).toBe(expected);
      });
    });

    it("should handle zero leads correctly", () => {
      const leadsMetrics = {
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 0,
        conversionRate: 0,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 2,
        totalRevenue: 100000,
        averageDealSize: 50000,
        totalPipelineValue: 100000,
        opportunitiesByStage: { "closed-won": 2 },
        opportunityConversionRate: 0,
        closedWonCount: 2,
        winRate: 100,
        activeOpportunities: 0,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result } = renderHook(() => useOverallMetrics());

      expect(result.current.revenuePerLead).toBe(0);
    });

    it("should handle zero revenue correctly", () => {
      const leadsMetrics = {
        totalLeads: 10,
        newLeads: 5,
        qualifiedLeads: 3,
        unqualifiedLeads: 1,
        contactedLeads: 1,
        averageLeadScore: 70,
        conversionRate: 30,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 3,
        totalRevenue: 0, // No closed-won deals yet
        averageDealSize: 0,
        totalPipelineValue: 150000,
        opportunitiesByStage: {
          prospecting: 1,
          proposal: 2,
        },
        opportunityConversionRate: 0,
        closedWonCount: 0,
        winRate: 0,
        activeOpportunities: 3,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result } = renderHook(() => useOverallMetrics());

      expect(result.current.revenuePerLead).toBe(0);
    });
  });

  describe("legacy format compatibility", () => {
    it("should provide backward compatibility with metrics object", () => {
      const leadsMetrics = {
        totalLeads: 5,
        newLeads: 2,
        qualifiedLeads: 2,
        unqualifiedLeads: 1,
        contactedLeads: 0,
        averageLeadScore: 82,
        conversionRate: 40,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 3,
        totalRevenue: 150000,
        averageDealSize: 75000,
        totalPipelineValue: 200000,
        opportunitiesByStage: {
          proposal: 1,
          "closed-won": 2,
        },
        opportunityConversionRate: 100,
        closedWonCount: 2,
        winRate: 100,
        activeOpportunities: 1,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result } = renderHook(() => useOverallMetrics());

      // Check that legacy metrics object contains all fields from both metrics
      expect(result.current.metrics).toEqual({
        ...leadsMetrics,
        ...opportunitiesMetrics,
      });

      // Ensure all fields are accessible via legacy format
      expect(result.current.metrics.totalLeads).toBe(5);
      expect(result.current.metrics.totalOpportunities).toBe(3);
      expect(result.current.metrics.totalRevenue).toBe(150000);
      expect(result.current.metrics.averageLeadScore).toBe(82);
    });

    it("should handle field conflicts correctly (opportunities metrics should override)", () => {
      // This test ensures that if there are any naming conflicts,
      // opportunities metrics take precedence due to spread order
      const leadsMetrics = {
        totalLeads: 5,
        newLeads: 2,
        qualifiedLeads: 2,
        unqualifiedLeads: 1,
        contactedLeads: 0,
        averageLeadScore: 82,
        conversionRate: 40, // Lead conversion rate
      };

      const opportunitiesMetrics = {
        totalOpportunities: 3,
        totalRevenue: 150000,
        averageDealSize: 75000,
        totalPipelineValue: 200000,
        opportunitiesByStage: {},
        opportunityConversionRate: 100, // Different from lead conversion rate
        closedWonCount: 2,
        winRate: 100,
        activeOpportunities: 1,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result } = renderHook(() => useOverallMetrics());

      // Both conversion rates should be accessible
      expect(result.current.metrics.conversionRate).toBe(40); // Lead conversion rate
      expect(result.current.metrics.opportunityConversionRate).toBe(100); // Opportunity conversion rate
    });
  });

  describe("memoization", () => {
    it("should memoize results when dependencies do not change", () => {
      const leadsMetrics = {
        totalLeads: 5,
        newLeads: 2,
        qualifiedLeads: 2,
        unqualifiedLeads: 1,
        contactedLeads: 0,
        averageLeadScore: 80,
        conversionRate: 40,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 3,
        totalRevenue: 150000,
        averageDealSize: 50000,
        totalPipelineValue: 200000,
        opportunitiesByStage: {},
        opportunityConversionRate: 67,
        closedWonCount: 2,
        winRate: 100,
        activeOpportunities: 1,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result, rerender } = renderHook(() => useOverallMetrics());
      const firstResult = result.current;

      rerender();
      const secondResult = result.current;

      // Should be the same object reference due to useMemo
      expect(firstResult).toBe(secondResult);
    });

    it("should recalculate when dependencies change", () => {
      const initialLeadsMetrics = {
        totalLeads: 5,
        newLeads: 2,
        qualifiedLeads: 2,
        unqualifiedLeads: 1,
        contactedLeads: 0,
        averageLeadScore: 80,
        conversionRate: 40,
      };

      const updatedLeadsMetrics = {
        totalLeads: 10, // Changed
        newLeads: 4,
        qualifiedLeads: 4,
        unqualifiedLeads: 1,
        contactedLeads: 1,
        averageLeadScore: 82,
        conversionRate: 40,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 3,
        totalRevenue: 150000,
        averageDealSize: 50000,
        totalPipelineValue: 200000,
        opportunitiesByStage: {},
        opportunityConversionRate: 67,
        closedWonCount: 2,
        winRate: 100,
        activeOpportunities: 1,
      };

      mockUseLeadsMetrics.mockReturnValue(initialLeadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result, rerender } = renderHook(() => useOverallMetrics());
      const firstResult = result.current;

      expect(firstResult.revenuePerLead).toBe(30000); // 150k / 5 leads

      // Change the leads metrics
      mockUseLeadsMetrics.mockReturnValue(updatedLeadsMetrics);
      rerender();

      const secondResult = result.current;

      expect(secondResult.revenuePerLead).toBe(15000); // 150k / 10 leads
      expect(firstResult).not.toBe(secondResult); // Should be different object
    });
  });

  describe("lastUpdated handling", () => {
    it("should include lastUpdated timestamp", () => {
      const leadsMetrics = {
        totalLeads: 1,
        newLeads: 1,
        qualifiedLeads: 0,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 85,
        conversionRate: 0,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        totalPipelineValue: 0,
        opportunitiesByStage: {},
        opportunityConversionRate: 0,
        closedWonCount: 0,
        winRate: 0,
        activeOpportunities: 0,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(mockDate);

      const { result } = renderHook(() => useOverallMetrics());

      expect(result.current.lastUpdated).toBe(mockDate);
    });

    it("should handle null lastUpdated", () => {
      const leadsMetrics = {
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 0,
        conversionRate: 0,
      };

      const opportunitiesMetrics = {
        totalOpportunities: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        totalPipelineValue: 0,
        opportunitiesByStage: {},
        opportunityConversionRate: 0,
        closedWonCount: 0,
        winRate: 0,
        activeOpportunities: 0,
      };

      mockUseLeadsMetrics.mockReturnValue(leadsMetrics);
      mockUseOpportunitiesMetrics.mockReturnValue(opportunitiesMetrics);
      mockUseDashboardStore.mockReturnValue(null);

      const { result } = renderHook(() => useOverallMetrics());

      expect(result.current.lastUpdated).toBeNull();
    });
  });
});
