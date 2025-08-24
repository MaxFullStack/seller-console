import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  type MockedFunction,
} from "vitest";
import { leadRepository } from "../leads/api/lead-repository";
import { opportunityRepository } from "../opportunities/api/opportunity-repository";
import type { Lead, CreateLeadInput, LeadStatus } from "../leads/model/lead";
import type {
  Opportunity,
  CreateOpportunityInput,
} from "../opportunities/model/opportunity";

// Mock utils
vi.mock("@/lib/utils", () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  generateId: vi.fn(() => `lifecycle-${Date.now()}-${Math.random()}`),
}));

// Mock fetch for lead repository
global.fetch = vi.fn();

describe("End-to-End Lead Lifecycle Integration", () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Lead Journey: Creation → Qualification → Conversion → Opportunity Management", () => {
    it("should handle full successful lead lifecycle", async () => {
      // Step 1: Create initial lead
      const initialLeadData: CreateLeadInput = {
        name: "Sarah Johnson",
        company: "InnovateTech Solutions",
        email: "sarah.johnson@innovatetech.com",
        source: "web",
        score: 65,
        status: "new",
      };

      const newLead = await leadRepository.create(initialLeadData);

      expect(newLead).toMatchObject(initialLeadData);
      expect(newLead.id).toBeDefined();
      expect(newLead.status).toBe("new");
      expect(newLead.score).toBe(65);

      // Step 2: First contact - update to contacted status
      const contactedLead = await leadRepository.update({
        id: newLead.id,
        status: "contacted",
        score: 70, // Score improved after contact
      });

      expect(contactedLead.status).toBe("contacted");
      expect(contactedLead.score).toBe(70);
      expect(contactedLead.email).toBe(initialLeadData.email); // Other fields preserved

      // Step 3: Discovery call - improve score and keep contacted
      const discoveredLead = await leadRepository.update({
        id: contactedLead.id,
        score: 78, // Score improved after discovery
      });

      expect(discoveredLead.status).toBe("contacted"); // Status unchanged
      expect(discoveredLead.score).toBe(78);

      // Step 4: Qualification - promote to qualified
      const qualifiedLead = await leadRepository.update({
        id: discoveredLead.id,
        status: "qualified",
        score: 85, // Final qualification score
      });

      expect(qualifiedLead.status).toBe("qualified");
      expect(qualifiedLead.score).toBe(85);

      // Step 5: Lead to Opportunity conversion
      const opportunityData: CreateOpportunityInput = {
        name: `${qualifiedLead.company} - Enterprise Implementation`,
        stage: "qualification",
        amount: 150000,
        accountName: qualifiedLead.company,
        leadId: qualifiedLead.id,
      };

      const newOpportunity =
        await opportunityRepository.create(opportunityData);

      expect(newOpportunity).toMatchObject({
        name: `${qualifiedLead.company} - Enterprise Implementation`,
        stage: "qualification",
        amount: 150000,
        accountName: qualifiedLead.company,
        leadId: qualifiedLead.id,
      });
      expect(newOpportunity.id).toBeDefined();

      // Step 6: Opportunity progression through pipeline
      const needsAnalysisOpportunity = await opportunityRepository.update({
        id: newOpportunity.id,
        stage: "needs-analysis",
      });

      expect(needsAnalysisOpportunity.stage).toBe("needs-analysis");
      expect(needsAnalysisOpportunity.amount).toBe(150000); // Amount preserved

      const proposalOpportunity = await opportunityRepository.update({
        id: needsAnalysisOpportunity.id,
        stage: "proposal",
        amount: 175000, // Adjusted after needs analysis
      });

      expect(proposalOpportunity.stage).toBe("proposal");
      expect(proposalOpportunity.amount).toBe(175000);

      const negotiationOpportunity = await opportunityRepository.update({
        id: proposalOpportunity.id,
        stage: "negotiation",
        amount: 160000, // Negotiated down
      });

      expect(negotiationOpportunity.stage).toBe("negotiation");
      expect(negotiationOpportunity.amount).toBe(160000);

      // Step 7: Close as won
      const closedWonOpportunity = await opportunityRepository.update({
        id: negotiationOpportunity.id,
        stage: "closed-won",
      });

      expect(closedWonOpportunity.stage).toBe("closed-won");
      expect(closedWonOpportunity.amount).toBe(160000);

      // Step 8: Clean up - remove original lead (conversion complete)
      await leadRepository.delete(qualifiedLead.id);

      // Step 9: Verify final state
      const finalLeads = await leadRepository.list();
      const finalOpportunities = await opportunityRepository.list();

      // Original lead should be gone
      expect(finalLeads.some((lead) => lead.id === qualifiedLead.id)).toBe(
        false,
      );

      // Opportunity should exist with full history
      const finalOpportunity = finalOpportunities.find(
        (opp) => opp.leadId === qualifiedLead.id,
      );
      expect(finalOpportunity).toBeDefined();
      expect(finalOpportunity?.stage).toBe("closed-won");
      expect(finalOpportunity?.amount).toBe(160000);
      expect(finalOpportunity?.leadId).toBe(qualifiedLead.id); // Reference preserved
    });

    it("should handle lead disqualification path", async () => {
      // Create lead that will be disqualified
      const leadData: CreateLeadInput = {
        name: "Mike Thompson",
        company: "SmallBiz Corp",
        email: "mike@smallbiz.com",
        source: "phone",
        score: 55,
        status: "new",
      };

      const newLead = await leadRepository.create(leadData);

      // Contact and discover poor fit
      const contactedLead = await leadRepository.update({
        id: newLead.id,
        status: "contacted",
        score: 50, // Score decreased after contact
      });

      expect(contactedLead.status).toBe("contacted");
      expect(contactedLead.score).toBe(50);

      // Further discovery shows not qualified
      const disqualifiedLead = await leadRepository.update({
        id: contactedLead.id,
        status: "unqualified",
        score: 35, // Low final score
      });

      expect(disqualifiedLead.status).toBe("unqualified");
      expect(disqualifiedLead.score).toBe(35);

      // Disqualified leads should remain in system for analysis
      const allLeads = await leadRepository.list();
      const preservedLead = allLeads.find(
        (lead) => lead.id === disqualifiedLead.id,
      );

      expect(preservedLead).toBeDefined();
      expect(preservedLead?.status).toBe("unqualified");
      expect(preservedLead?.score).toBe(35);

      // No opportunity should be created for unqualified leads
      const allOpportunities = await opportunityRepository.list();
      const relatedOpportunity = allOpportunities.find(
        (opp) => opp.leadId === disqualifiedLead.id,
      );

      expect(relatedOpportunity).toBeUndefined();
    });

    it("should handle opportunity loss after conversion", async () => {
      // Create and qualify lead
      const leadData: CreateLeadInput = {
        name: "Jennifer Davis",
        company: "TechStartup Inc",
        email: "jen@techstartup.com",
        source: "referral",
        score: 90,
        status: "qualified",
      };

      const qualifiedLead = await leadRepository.create(leadData);

      // Convert to opportunity
      const opportunityData: CreateOpportunityInput = {
        name: "TechStartup Inc - Platform Migration",
        stage: "proposal",
        amount: 85000,
        accountName: qualifiedLead.company,
        leadId: qualifiedLead.id,
      };

      const newOpportunity =
        await opportunityRepository.create(opportunityData);

      // Progress through pipeline
      const negotiationOpportunity = await opportunityRepository.update({
        id: newOpportunity.id,
        stage: "negotiation",
        amount: 75000, // Negotiated down
      });

      // Unfortunately, lose the deal
      const lostOpportunity = await opportunityRepository.update({
        id: negotiationOpportunity.id,
        stage: "closed-lost",
      });

      expect(lostOpportunity.stage).toBe("closed-lost");
      expect(lostOpportunity.amount).toBe(75000);
      expect(lostOpportunity.leadId).toBe(qualifiedLead.id);

      // Lost opportunities should remain for analysis
      const allOpportunities = await opportunityRepository.list();
      const preservedOpportunity = allOpportunities.find(
        (opp) => opp.id === lostOpportunity.id,
      );

      expect(preservedOpportunity).toBeDefined();
      expect(preservedOpportunity?.stage).toBe("closed-lost");

      // Original lead can be cleaned up after loss analysis
      await leadRepository.delete(qualifiedLead.id);

      const finalLeads = await leadRepository.list();
      expect(finalLeads.some((lead) => lead.id === qualifiedLead.id)).toBe(
        false,
      );

      // But opportunity history is preserved
      const finalOpportunities = await opportunityRepository.list();
      const finalOpportunity = finalOpportunities.find(
        (opp) => opp.leadId === qualifiedLead.id,
      );
      expect(finalOpportunity?.stage).toBe("closed-lost");
    });
  });

  describe("Multiple Lead Lifecycle Scenarios", () => {
    it("should handle diverse lead outcomes simultaneously", async () => {
      // Create multiple leads with different destinies
      const leadScenarios: Array<{
        data: CreateLeadInput;
        journey: Array<{ status?: LeadStatus; score?: number }>;
        shouldConvert: boolean;
        opportunityStage?: "closed-won" | "closed-lost" | "proposal";
      }> = [
        {
          data: {
            name: "Alice Winner",
            company: "WinCorp",
            email: "alice@wincorp.com",
            source: "web",
            score: 80,
            status: "new",
          },
          journey: [
            { status: "contacted", score: 85 },
            { status: "qualified", score: 92 },
          ],
          shouldConvert: true,
          opportunityStage: "closed-won",
        },
        {
          data: {
            name: "Bob Loser",
            company: "LoseCorp",
            email: "bob@losecorp.com",
            source: "email",
            score: 75,
            status: "new",
          },
          journey: [
            { status: "contacted", score: 78 },
            { status: "qualified", score: 88 },
          ],
          shouldConvert: true,
          opportunityStage: "closed-lost",
        },
        {
          data: {
            name: "Carol Unqualified",
            company: "BadFitCorp",
            email: "carol@badfit.com",
            source: "phone",
            score: 60,
            status: "new",
          },
          journey: [
            { status: "contacted", score: 55 },
            { status: "unqualified", score: 40 },
          ],
          shouldConvert: false,
        },
        {
          data: {
            name: "David Pending",
            company: "PendingCorp",
            email: "david@pending.com",
            source: "social",
            score: 70,
            status: "new",
          },
          journey: [
            { status: "contacted", score: 73 },
            { status: "qualified", score: 85 },
          ],
          shouldConvert: true,
          opportunityStage: "proposal",
        },
      ];

      const results: Array<{
        lead: Lead;
        opportunity?: Opportunity;
        scenario: (typeof leadScenarios)[0];
      }> = [];

      // Process each lead through its journey
      for (const scenario of leadScenarios) {
        let currentLead = await leadRepository.create(scenario.data);

        // Follow the journey
        for (const step of scenario.journey) {
          currentLead = await leadRepository.update({
            id: currentLead.id,
            ...(step.status && { status: step.status }),
            ...(step.score && { score: step.score }),
          });
        }

        let opportunity: Opportunity | undefined;

        if (scenario.shouldConvert) {
          // Convert to opportunity
          const opportunityData: CreateOpportunityInput = {
            name: `${currentLead.company} - ${scenario.opportunityStage} Deal`,
            stage:
              scenario.opportunityStage === "proposal"
                ? "proposal"
                : "negotiation",
            amount: 50000 + Math.floor(Math.random() * 100000),
            accountName: currentLead.company,
            leadId: currentLead.id,
          };

          opportunity = await opportunityRepository.create(opportunityData);

          // Close won/lost if specified
          if (
            scenario.opportunityStage &&
            scenario.opportunityStage !== "proposal"
          ) {
            opportunity = await opportunityRepository.update({
              id: opportunity.id,
              stage: scenario.opportunityStage,
            });
          }

          // Clean up qualified leads after conversion
          if (currentLead.status === "qualified") {
            await leadRepository.delete(currentLead.id);
          }
        }

        results.push({ lead: currentLead, opportunity, scenario });
      }

      // Verify final state
      const finalLeads = await leadRepository.list();
      const finalOpportunities = await opportunityRepository.list();

      // Check each scenario outcome
      for (const result of results) {
        if (
          result.scenario.shouldConvert &&
          result.scenario.opportunityStage !== "proposal"
        ) {
          // Converted and closed leads should be removed
          expect(finalLeads.some((lead) => lead.id === result.lead.id)).toBe(
            false,
          );
        } else if (!result.scenario.shouldConvert) {
          // Unqualified leads should remain
          expect(finalLeads.some((lead) => lead.id === result.lead.id)).toBe(
            true,
          );
        }

        if (result.opportunity) {
          // All opportunities should exist
          const finalOpportunity = finalOpportunities.find(
            (opp) => opp.id === result.opportunity!.id,
          );
          expect(finalOpportunity).toBeDefined();
          expect(finalOpportunity?.stage).toBe(
            result.scenario.opportunityStage || "proposal",
          );
        }
      }

      // Verify counts
      const wonOpportunities = finalOpportunities.filter(
        (opp) => opp.stage === "closed-won",
      );
      const lostOpportunities = finalOpportunities.filter(
        (opp) => opp.stage === "closed-lost",
      );
      const activeOpportunities = finalOpportunities.filter(
        (opp) => !["closed-won", "closed-lost"].includes(opp.stage),
      );

      expect(wonOpportunities.length).toBeGreaterThanOrEqual(1);
      expect(lostOpportunities.length).toBeGreaterThanOrEqual(1);
      expect(activeOpportunities.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Lead Lifecycle Error Recovery", () => {
    it("should handle partial failure scenarios gracefully", async () => {
      // Create lead
      const leadData: CreateLeadInput = {
        name: "Recovery Test Lead",
        company: "RecoveryCorp",
        email: "test@recovery.com",
        source: "web",
        score: 80,
        status: "new",
      };

      const newLead = await leadRepository.create(leadData);

      // Successful progression
      const qualifiedLead = await leadRepository.update({
        id: newLead.id,
        status: "qualified",
        score: 90,
      });

      expect(qualifiedLead.status).toBe("qualified");

      // Attempt invalid opportunity creation (should fail)
      const invalidOpportunityData: CreateOpportunityInput = {
        name: "", // Invalid - empty name
        stage: "proposal",
        amount: 50000,
        accountName: "", // Invalid - empty account name
        leadId: qualifiedLead.id,
      };

      // Should throw error and not affect lead
      await expect(
        opportunityRepository.create(invalidOpportunityData),
      ).rejects.toThrow();

      // Lead should still exist and be qualified
      const leadsAfterFailure = await leadRepository.list();
      const preservedLead = leadsAfterFailure.find(
        (lead) => lead.id === qualifiedLead.id,
      );

      expect(preservedLead).toBeDefined();
      expect(preservedLead?.status).toBe("qualified");
      expect(preservedLead?.score).toBe(90);

      // Retry with valid data
      const validOpportunityData: CreateOpportunityInput = {
        name: "RecoveryCorp - Valid Opportunity",
        stage: "proposal",
        amount: 50000,
        accountName: "RecoveryCorp",
        leadId: qualifiedLead.id,
      };

      const recoveredOpportunity =
        await opportunityRepository.create(validOpportunityData);

      expect(recoveredOpportunity.name).toBe(
        "RecoveryCorp - Valid Opportunity",
      );
      expect(recoveredOpportunity.leadId).toBe(qualifiedLead.id);

      // Complete the lifecycle
      await leadRepository.delete(qualifiedLead.id);

      const finalOpportunities = await opportunityRepository.list();
      const finalOpportunity = finalOpportunities.find(
        (opp) => opp.leadId === qualifiedLead.id,
      );

      expect(finalOpportunity).toBeDefined();
      expect(finalOpportunity?.name).toBe("RecoveryCorp - Valid Opportunity");
    });
  });
});
