import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from "vitest";
import { renderHook, act } from "@testing-library/react";
import { leadRepository } from "../leads/api/lead-repository";
import { opportunityRepository } from "../opportunities/api/opportunity-repository";
import { useDashboardStore } from "@/store/dashboard-store";
import { useLeadsMetrics } from "../dashboard/hooks/use-leads-metrics";
import { useOpportunitiesMetrics } from "../dashboard/hooks/use-opportunities-metrics";
import { useOverallMetrics } from "../dashboard/hooks/use-overall-metrics";
import type { Lead, CreateLeadInput } from "../leads/model/lead";
import type {
  Opportunity,
  CreateOpportunityInput,
} from "../opportunities/model/opportunity";

// Mock utils
vi.mock("@/lib/utils", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  generateId: vi.fn(() => `mock-id-${Date.now()}-${Math.random()}`),
}));

// Mock fetch for lead repository
global.fetch = vi.fn();

describe("Dashboard Data Integration", () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Mock fetch to return empty data (fallback to mock data)
    (fetch as MockedFunction<typeof fetch>).mockRejectedValue(
      new Error("No data file"),
    );

    vi.clearAllMocks();

    // Clear dashboard store
    useDashboardStore.getState().setLeads([]);
    useDashboardStore.getState().setOpportunities([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Real-time Metrics Calculation from Live Data", () => {
    it("should calculate accurate metrics from actual repository data", async () => {
      // Create test leads with known data
      const leadInputs: CreateLeadInput[] = [
        {
          name: "Lead 1",
          company: "Company 1",
          email: "lead1@co1.com",
          source: "web",
          score: 80,
          status: "new",
        },
        {
          name: "Lead 2",
          company: "Company 2",
          email: "lead2@co2.com",
          source: "email",
          score: 90,
          status: "qualified",
        },
        {
          name: "Lead 3",
          company: "Company 3",
          email: "lead3@co3.com",
          source: "referral",
          score: 70,
          status: "qualified",
        },
        {
          name: "Lead 4",
          company: "Company 4",
          email: "lead4@co4.com",
          source: "social",
          score: 60,
          status: "contacted",
        },
        {
          name: "Lead 5",
          company: "Company 5",
          email: "lead5@co5.com",
          source: "phone",
          score: 95,
          status: "unqualified",
        },
      ];

      const createdLeads: Lead[] = [];
      for (const input of leadInputs) {
        const lead = await leadRepository.create(input);
        createdLeads.push(lead);
      }

      // Create test opportunities
      const opportunityInputs: CreateOpportunityInput[] = [
        {
          name: "Opp 1",
          stage: "closed-won",
          amount: 50000,
          accountName: "Account 1",
          leadId: createdLeads[1].id,
        },
        {
          name: "Opp 2",
          stage: "closed-won",
          amount: 75000,
          accountName: "Account 2",
          leadId: createdLeads[2].id,
        },
        {
          name: "Opp 3",
          stage: "closed-lost",
          amount: 40000,
          accountName: "Account 3",
          leadId: createdLeads[3].id,
        },
        {
          name: "Opp 4",
          stage: "proposal",
          amount: 60000,
          accountName: "Account 4",
        },
        {
          name: "Opp 5",
          stage: "negotiation",
          amount: 85000,
          accountName: "Account 5",
        },
      ];

      const createdOpportunities: Opportunity[] = [];
      for (const input of opportunityInputs) {
        const opportunity = await opportunityRepository.create(input);
        createdOpportunities.push(opportunity);
      }

      // Load data into dashboard store
      const allLeads = await leadRepository.list();
      const allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      // Test leads metrics
      const { result: leadsMetricsResult } = renderHook(() =>
        useLeadsMetrics(),
      );

      expect(leadsMetricsResult.current.totalLeads).toBeGreaterThanOrEqual(5);
      expect(leadsMetricsResult.current.qualifiedLeads).toBeGreaterThanOrEqual(
        2,
      );
      expect(leadsMetricsResult.current.newLeads).toBeGreaterThanOrEqual(1);
      expect(leadsMetricsResult.current.contactedLeads).toBeGreaterThanOrEqual(
        1,
      );
      expect(
        leadsMetricsResult.current.unqualifiedLeads,
      ).toBeGreaterThanOrEqual(1);

      // Average score should be around (80+90+70+60+95)/5 = 79
      expect(leadsMetricsResult.current.averageLeadScore).toBeGreaterThan(70);
      expect(leadsMetricsResult.current.averageLeadScore).toBeLessThan(90);

      // Conversion rate should be around 2/5 = 40%
      expect(leadsMetricsResult.current.conversionRate).toBeGreaterThan(30);
      expect(leadsMetricsResult.current.conversionRate).toBeLessThan(50);

      // Test opportunities metrics
      const { result: opportunitiesMetricsResult } = renderHook(() =>
        useOpportunitiesMetrics(),
      );

      expect(
        opportunitiesMetricsResult.current.totalOpportunities,
      ).toBeGreaterThanOrEqual(5);
      expect(
        opportunitiesMetricsResult.current.closedWonCount,
      ).toBeGreaterThanOrEqual(2);
      expect(
        opportunitiesMetricsResult.current.totalRevenue,
      ).toBeGreaterThanOrEqual(125000); // 50k + 75k
      expect(
        opportunitiesMetricsResult.current.activeOpportunities,
      ).toBeGreaterThanOrEqual(2);

      // Win rate should be around 2/3 = 67% (2 won out of 3 closed)
      expect(opportunitiesMetricsResult.current.winRate).toBeGreaterThan(60);
      expect(opportunitiesMetricsResult.current.winRate).toBeLessThan(75);

      // Test overall metrics
      const { result: overallMetricsResult } = renderHook(() =>
        useOverallMetrics(),
      );

      expect(overallMetricsResult.current.revenuePerLead).toBeGreaterThan(
        15000,
      ); // 125k+ / 8+ leads
      expect(overallMetricsResult.current.lastUpdated).toBeDefined();
      expect(overallMetricsResult.current.leads.totalLeads).toBe(
        leadsMetricsResult.current.totalLeads,
      );
      expect(overallMetricsResult.current.opportunities.totalRevenue).toBe(
        opportunitiesMetricsResult.current.totalRevenue,
      );
    });

    it("should update metrics dynamically when data changes", async () => {
      // Initial state - create minimal data
      const initialLeadInput: CreateLeadInput = {
        name: "Initial Lead",
        company: "Initial Company",
        email: "initial@company.com",
        source: "web",
        score: 80,
        status: "new",
      };

      const initialLead = await leadRepository.create(initialLeadInput);

      let allLeads = await leadRepository.list();
      let allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      const { result: leadsMetricsResult, rerender: leadsRerender } =
        renderHook(() => useLeadsMetrics());
      const {
        result: opportunitiesMetricsResult,
        rerender: opportunitiesRerender,
      } = renderHook(() => useOpportunitiesMetrics());

      const initialOpportunitiesCount =
        opportunitiesMetricsResult.current.totalOpportunities;
      const initialRevenue = opportunitiesMetricsResult.current.totalRevenue;

      // Update lead to qualified
      const qualifiedLead = await leadRepository.update({
        id: initialLead.id,
        status: "qualified",
        score: 90,
      });

      // Create opportunity from qualified lead
      const opportunityInput: CreateOpportunityInput = {
        name: "New Opportunity",
        stage: "closed-won",
        amount: 100000,
        accountName: qualifiedLead.company,
        leadId: qualifiedLead.id,
      };

      await opportunityRepository.create(opportunityInput);

      // Update dashboard store with new data
      allLeads = await leadRepository.list();
      allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      leadsRerender();
      opportunitiesRerender();

      // Verify metrics updated correctly
      expect(leadsMetricsResult.current.qualifiedLeads).toBeGreaterThan(0);
      expect(opportunitiesMetricsResult.current.totalOpportunities).toBe(
        initialOpportunitiesCount + 1,
      );
      expect(opportunitiesMetricsResult.current.totalRevenue).toBe(
        initialRevenue + 100000,
      );
      expect(opportunitiesMetricsResult.current.closedWonCount).toBeGreaterThan(
        0,
      );

      // Delete the lead (conversion cleanup)
      await leadRepository.delete(qualifiedLead.id);

      allLeads = await leadRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
      });

      leadsRerender();

      // After deleting the custom lead, repository falls back to mock data
      // so total leads should be the mock data count (which includes the mock leads)
      expect(leadsMetricsResult.current.totalLeads).toBeGreaterThanOrEqual(5); // Mock data leads
      expect(opportunitiesMetricsResult.current.totalOpportunities).toBe(
        initialOpportunitiesCount + 1,
      );
    });
  });

  describe("Cross-Domain Metrics Accuracy", () => {
    it("should calculate revenue per lead correctly with real conversion data", async () => {
      // Create qualified leads
      const qualifiedLeads: Lead[] = [];

      for (let i = 1; i <= 4; i++) {
        const leadInput: CreateLeadInput = {
          name: `Sales Lead ${i}`,
          company: `Company ${i}`,
          email: `lead${i}@company${i}.com`,
          source: "web",
          score: 85 + i,
          status: "qualified",
        };

        const lead = await leadRepository.create(leadInput);
        qualifiedLeads.push(lead);
      }

      // Convert 2 leads to won opportunities, 1 to lost
      const conversions = [
        {
          leadId: qualifiedLeads[0].id,
          amount: 80000,
          stage: "closed-won" as const,
        },
        {
          leadId: qualifiedLeads[1].id,
          amount: 120000,
          stage: "closed-won" as const,
        },
        {
          leadId: qualifiedLeads[2].id,
          amount: 60000,
          stage: "closed-lost" as const,
        },
        // qualifiedLeads[3] remains unconverted
      ];

      const opportunities: Opportunity[] = [];
      for (const conversion of conversions) {
        const leadIndex = qualifiedLeads.findIndex(
          (lead) => lead.id === conversion.leadId,
        );
        const lead = qualifiedLeads[leadIndex];

        const opportunityInput: CreateOpportunityInput = {
          name: `${lead.company} - Sales Deal`,
          stage: conversion.stage,
          amount: conversion.amount,
          accountName: lead.company,
          leadId: lead.id,
        };

        const opportunity =
          await opportunityRepository.create(opportunityInput);
        opportunities.push(opportunity);
      }

      // Load data into dashboard
      const allLeads = await leadRepository.list();
      const allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      const { result: overallMetricsResult } = renderHook(() =>
        useOverallMetrics(),
      );

      // Total revenue: 80k + 120k = 200k (only closed-won)
      // Total leads: at least 4 (plus any mock data)
      // Revenue per lead should be reasonable
      expect(
        overallMetricsResult.current.opportunities.totalRevenue,
      ).toBeGreaterThanOrEqual(200000);
      expect(overallMetricsResult.current.revenuePerLead).toBeGreaterThan(0);

      // Should be less than 200k (since we have more leads than won deals)
      expect(overallMetricsResult.current.revenuePerLead).toBeLessThan(200000);

      // Conversion rate calculations
      expect(
        overallMetricsResult.current.opportunities.opportunityConversionRate,
      ).toBeGreaterThan(0);
      expect(
        overallMetricsResult.current.opportunities.winRate,
      ).toBeGreaterThan(50); // 2/3 = 67%
    });

    it("should handle edge cases in cross-domain calculations", async () => {
      // Test with no revenue (all active opportunities)
      const leadInput: CreateLeadInput = {
        name: "Test Lead",
        company: "Test Company",
        email: "test@company.com",
        source: "email",
        score: 75,
        status: "qualified",
      };

      const lead = await leadRepository.create(leadInput);

      const opportunityInput: CreateOpportunityInput = {
        name: "Active Opportunity",
        stage: "proposal",
        amount: 50000,
        accountName: lead.company,
        leadId: lead.id,
      };

      await opportunityRepository.create(opportunityInput);

      const allLeads = await leadRepository.list();
      const allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      const { result: overallMetricsResult } = renderHook(() =>
        useOverallMetrics(),
      );

      // Should handle zero revenue scenario
      expect(
        overallMetricsResult.current.opportunities.totalRevenue,
      ).toBeGreaterThanOrEqual(0);
      expect(
        overallMetricsResult.current.opportunities.totalPipelineValue,
      ).toBeGreaterThan(0);
      expect(
        overallMetricsResult.current.opportunities.activeOpportunities,
      ).toBeGreaterThan(0);
    });
  });

  describe("Store Synchronization", () => {
    it("should maintain data consistency between repositories and dashboard store", async () => {
      // Create data in repositories
      const leadInput: CreateLeadInput = {
        name: "Sync Test Lead",
        company: "SyncCorp",
        email: "sync@synccorp.com",
        source: "referral",
        score: 88,
        status: "qualified",
      };

      const repositoryLead = await leadRepository.create(leadInput);

      const opportunityInput: CreateOpportunityInput = {
        name: "SyncCorp - Integration Project",
        stage: "negotiation",
        amount: 90000,
        accountName: repositoryLead.company,
        leadId: repositoryLead.id,
      };

      const repositoryOpportunity =
        await opportunityRepository.create(opportunityInput);

      // Load into store
      const allLeads = await leadRepository.list();
      const allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      // Verify store contains repository data
      const storeState = useDashboardStore.getState();

      expect(
        storeState.leads.some((lead) => lead.id === repositoryLead.id),
      ).toBe(true);
      expect(
        storeState.opportunities.some(
          (opp) => opp.id === repositoryOpportunity.id,
        ),
      ).toBe(true);

      const storeLeadCopy = storeState.leads.find(
        (lead) => lead.id === repositoryLead.id,
      );
      const storeOpportunityCopy = storeState.opportunities.find(
        (opp) => opp.id === repositoryOpportunity.id,
      );

      expect(storeLeadCopy).toEqual(repositoryLead);
      expect(storeOpportunityCopy).toEqual(repositoryOpportunity);

      // Verify metrics calculate from store data
      const { result: metricsResult } = renderHook(() => useOverallMetrics());

      expect(metricsResult.current.leads.totalLeads).toBe(
        storeState.leads.length,
      );
      expect(metricsResult.current.opportunities.totalOpportunities).toBe(
        storeState.opportunities.length,
      );
    });

    it("should handle lastUpdated timestamp correctly", async () => {
      const initialTimestamp = useDashboardStore.getState().lastUpdated;

      // Create and load leads
      const leadInput: CreateLeadInput = {
        name: "Timestamp Lead",
        company: "TimeCorp",
        email: "time@timecorp.com",
        source: "web",
        score: 82,
        status: "new",
      };

      await leadRepository.create(leadInput);
      const allLeads = await leadRepository.list();

      act(() => {
        useDashboardStore.getState().setLeads(allLeads);
      });

      const afterLeadsTimestamp = useDashboardStore.getState().lastUpdated;
      expect(afterLeadsTimestamp).not.toBe(initialTimestamp);
      expect(afterLeadsTimestamp).toBeInstanceOf(Date);

      // Wait a bit and update opportunities
      await new Promise((resolve) => setTimeout(resolve, 10));

      const opportunityInput: CreateOpportunityInput = {
        name: "TimeCorp - Timestamp Test",
        stage: "prospecting",
        amount: 45000,
        accountName: "TimeCorp",
      };

      await opportunityRepository.create(opportunityInput);
      const allOpportunities = await opportunityRepository.list();

      act(() => {
        useDashboardStore.getState().setOpportunities(allOpportunities);
      });

      const finalTimestamp = useDashboardStore.getState().lastUpdated;
      expect(finalTimestamp).not.toBe(afterLeadsTimestamp);
      expect(finalTimestamp?.getTime()).toBeGreaterThan(
        afterLeadsTimestamp?.getTime() || 0,
      );

      // Verify metrics use the latest timestamp
      const { result: metricsResult } = renderHook(() => useOverallMetrics());
      expect(metricsResult.current.lastUpdated).toBe(finalTimestamp);
    });
  });
});
