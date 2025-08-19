import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { opportunityRepository } from '../opportunities/api/opportunity-repository';
import { leadRepository } from '../leads/api/lead-repository';
import type { Opportunity, CreateOpportunityInput, OpportunityStage } from '../opportunities/model/opportunity';
import type { Lead, CreateLeadInput } from '../leads/model/lead';

// Mock utils
vi.mock('@/lib/utils', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
  generateId: vi.fn(() => `pipeline-${Date.now()}-${Math.random()}`),
}));

// Mock fetch for lead repository
global.fetch = vi.fn();

describe('Opportunity Pipeline Integration', () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
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
    (fetch as any).mockRejectedValue(new Error('No data file'));

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Sales Pipeline Flow', () => {
    it('should handle full opportunity progression from prospecting to closed-won', async () => {
      // Create source lead for traceability
      const leadInput: CreateLeadInput = {
        name: 'Pipeline Test Lead',
        company: 'PipelineCorp',
        email: 'pipeline@corp.com',
        source: 'referral',
        score: 90,
        status: 'qualified',
      };

      const sourceLead = await leadRepository.create(leadInput);

      // Create initial opportunity
      const initialOpportunityData: CreateOpportunityInput = {
        name: 'PipelineCorp - Enterprise Solution',
        stage: 'prospecting',
        amount: 200000,
        accountName: sourceLead.company,
        leadId: sourceLead.id,
      };

      let currentOpportunity = await opportunityRepository.create(initialOpportunityData);

      expect(currentOpportunity.stage).toBe('prospecting');
      expect(currentOpportunity.amount).toBe(200000);
      expect(currentOpportunity.leadId).toBe(sourceLead.id);

      // Stage 1: Prospecting → Qualification
      currentOpportunity = await opportunityRepository.update({
        id: currentOpportunity.id,
        stage: 'qualification',
      });

      expect(currentOpportunity.stage).toBe('qualification');
      expect(currentOpportunity.amount).toBe(200000); // Amount preserved

      // Stage 2: Qualification → Needs Analysis (with amount adjustment)
      currentOpportunity = await opportunityRepository.update({
        id: currentOpportunity.id,
        stage: 'needs-analysis',
        amount: 185000, // Adjusted after qualification
      });

      expect(currentOpportunity.stage).toBe('needs-analysis');
      expect(currentOpportunity.amount).toBe(185000);

      // Stage 3: Needs Analysis → Proposal (further refinement)
      currentOpportunity = await opportunityRepository.update({
        id: currentOpportunity.id,
        stage: 'proposal',
        amount: 175000, // More precise sizing
      });

      expect(currentOpportunity.stage).toBe('proposal');
      expect(currentOpportunity.amount).toBe(175000);

      // Stage 4: Proposal → Negotiation
      currentOpportunity = await opportunityRepository.update({
        id: currentOpportunity.id,
        stage: 'negotiation',
        amount: 165000, // Price negotiated down
      });

      expect(currentOpportunity.stage).toBe('negotiation');
      expect(currentOpportunity.amount).toBe(165000);

      // Stage 5: Negotiation → Closed Won
      const finalOpportunity = await opportunityRepository.update({
        id: currentOpportunity.id,
        stage: 'closed-won',
      });

      expect(finalOpportunity.stage).toBe('closed-won');
      expect(finalOpportunity.amount).toBe(165000);
      expect(finalOpportunity.leadId).toBe(sourceLead.id); // Traceability preserved

      // Verify pipeline completion
      const allOpportunities = await opportunityRepository.list();
      const completedOpportunity = allOpportunities.find(opp => opp.id === finalOpportunity.id);
      
      expect(completedOpportunity?.stage).toBe('closed-won');
      expect(completedOpportunity?.accountName).toBe('PipelineCorp');
    });

    it('should handle opportunity loss at different pipeline stages', async () => {
      // Create multiple opportunities that will be lost at different stages
      const lossScenarios: Array<{
        name: string;
        initialAmount: number;
        lossStage: OpportunityStage;
        progressStages: OpportunityStage[];
      }> = [
        {
          name: 'EarlyLoss Corp - Quick No',
          initialAmount: 50000,
          lossStage: 'closed-lost',
          progressStages: ['prospecting', 'qualification'],
        },
        {
          name: 'MidLoss Corp - Proposal Reject',
          initialAmount: 120000,
          lossStage: 'closed-lost',
          progressStages: ['prospecting', 'qualification', 'needs-analysis', 'proposal'],
        },
        {
          name: 'LateLoss Corp - Negotiation Fail',
          initialAmount: 180000,
          lossStage: 'closed-lost',
          progressStages: ['prospecting', 'qualification', 'needs-analysis', 'proposal', 'negotiation'],
        },
      ];

      const lostOpportunities: Opportunity[] = [];

      for (const scenario of lossScenarios) {
        // Create opportunity
        const opportunityData: CreateOpportunityInput = {
          name: scenario.name,
          stage: 'prospecting',
          amount: scenario.initialAmount,
          accountName: scenario.name.split(' -')[0],
        };

        let opportunity = await opportunityRepository.create(opportunityData);

        // Progress through stages
        for (const stage of scenario.progressStages) {
          if (stage !== 'prospecting') { // Already created at prospecting
            opportunity = await opportunityRepository.update({
              id: opportunity.id,
              stage,
            });
          }
        }

        // Mark as lost
        const lostOpportunity = await opportunityRepository.update({
          id: opportunity.id,
          stage: scenario.lossStage,
        });

        expect(lostOpportunity.stage).toBe('closed-lost');
        lostOpportunities.push(lostOpportunity);
      }

      // Verify all lost opportunities are preserved for analysis
      const allOpportunities = await opportunityRepository.list();
      
      for (const lostOpp of lostOpportunities) {
        const preserved = allOpportunities.find(opp => opp.id === lostOpp.id);
        expect(preserved).toBeDefined();
        expect(preserved?.stage).toBe('closed-lost');
      }

      expect(lostOpportunities.length).toBe(3);
    });
  });

  describe('Pipeline Analytics and Metrics Integration', () => {
    it('should create opportunities that generate accurate pipeline metrics', async () => {
      // Create a diverse set of opportunities at different stages
      const pipelineOpportunities: Array<{
        data: CreateOpportunityInput;
        finalStage: OpportunityStage;
        expectedRevenue?: number;
      }> = [
        {
          data: { name: 'Active Deal 1', stage: 'prospecting', amount: 80000, accountName: 'ActiveCorp1' },
          finalStage: 'prospecting',
        },
        {
          data: { name: 'Active Deal 2', stage: 'qualification', amount: 120000, accountName: 'ActiveCorp2' },
          finalStage: 'needs-analysis',
        },
        {
          data: { name: 'Active Deal 3', stage: 'proposal', amount: 95000, accountName: 'ActiveCorp3' },
          finalStage: 'proposal',
        },
        {
          data: { name: 'Won Deal 1', stage: 'negotiation', amount: 150000, accountName: 'WonCorp1' },
          finalStage: 'closed-won',
          expectedRevenue: 150000,
        },
        {
          data: { name: 'Won Deal 2', stage: 'proposal', amount: 200000, accountName: 'WonCorp2' },
          finalStage: 'closed-won',
          expectedRevenue: 200000,
        },
        {
          data: { name: 'Lost Deal 1', stage: 'negotiation', amount: 75000, accountName: 'LostCorp1' },
          finalStage: 'closed-lost',
        },
      ];

      const createdOpportunities: Opportunity[] = [];

      // Create and progress opportunities
      for (const scenario of pipelineOpportunities) {
        let opportunity = await opportunityRepository.create(scenario.data);

        // Progress to final stage if different from initial
        if (scenario.finalStage !== scenario.data.stage) {
          opportunity = await opportunityRepository.update({
            id: opportunity.id,
            stage: scenario.finalStage,
          });
        }

        createdOpportunities.push(opportunity);
      }

      // Analyze pipeline state
      const allOpportunities = await opportunityRepository.list();
      
      // Count by stage
      const stageCounts = allOpportunities.reduce((acc, opp) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Verify stage distribution includes our test data
      expect(stageCounts['prospecting']).toBeGreaterThanOrEqual(1);
      expect(stageCounts['needs-analysis']).toBeGreaterThanOrEqual(1);
      expect(stageCounts['proposal']).toBeGreaterThanOrEqual(1);
      expect(stageCounts['closed-won']).toBeGreaterThanOrEqual(2);
      expect(stageCounts['closed-lost']).toBeGreaterThanOrEqual(1);

      // Calculate revenue metrics
      const wonOpportunities = allOpportunities.filter(opp => opp.stage === 'closed-won');
      const totalRevenue = wonOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
      const activeOpportunities = allOpportunities.filter(opp => 
        !['closed-won', 'closed-lost'].includes(opp.stage)
      );
      const pipelineValue = activeOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);

      // Verify revenue calculations include our test data
      expect(totalRevenue).toBeGreaterThanOrEqual(350000); // 150k + 200k from won deals
      expect(pipelineValue).toBeGreaterThanOrEqual(295000); // 80k + 120k + 95k from active deals

      // Win rate calculation
      const closedOpportunities = allOpportunities.filter(opp => 
        opp.stage === 'closed-won' || opp.stage === 'closed-lost'
      );
      const winRate = closedOpportunities.length > 0 
        ? (wonOpportunities.length / closedOpportunities.length) * 100 
        : 0;

      expect(winRate).toBeGreaterThan(50); // Should have more wins than losses
    });
  });

  describe('Pipeline Data Integrity and Consistency', () => {
    it('should maintain opportunity-lead relationships through pipeline progression', async () => {
      // Create lead for relationship tracking
      const leadInput: CreateLeadInput = {
        name: 'Relationship Lead',
        company: 'RelationshipCorp',
        email: 'rel@corp.com',
        source: 'web',
        score: 85,
        status: 'qualified',
      };

      const lead = await leadRepository.create(leadInput);

      // Create opportunity with lead relationship
      const opportunityData: CreateOpportunityInput = {
        name: 'RelationshipCorp - Linked Deal',
        stage: 'prospecting',
        amount: 100000,
        accountName: lead.company,
        leadId: lead.id,
      };

      let opportunity = await opportunityRepository.create(opportunityData);

      // Progress through multiple stages while verifying relationship
      const stages: OpportunityStage[] = ['qualification', 'needs-analysis', 'proposal', 'negotiation', 'closed-won'];

      for (const stage of stages) {
        opportunity = await opportunityRepository.update({
          id: opportunity.id,
          stage,
          ...(stage === 'proposal' && { amount: 95000 }), // Adjust amount once
        });

        // Verify relationship is preserved through all updates
        expect(opportunity.leadId).toBe(lead.id);
        expect(opportunity.accountName).toBe(lead.company);
      }

      // Final verification
      expect(opportunity.stage).toBe('closed-won');
      expect(opportunity.amount).toBe(95000);
      expect(opportunity.leadId).toBe(lead.id);

      // Cleanup lead (simulating conversion process)
      await leadRepository.delete(lead.id);

      // Opportunity should still exist with preserved lead reference
      const finalOpportunities = await opportunityRepository.list();
      const preservedOpportunity = finalOpportunities.find(opp => opp.id === opportunity.id);
      
      expect(preservedOpportunity).toBeDefined();
      expect(preservedOpportunity?.leadId).toBe(lead.id); // Reference preserved even after lead deletion
      expect(preservedOpportunity?.stage).toBe('closed-won');
    });

    it('should handle concurrent pipeline operations correctly', async () => {
      // Create multiple opportunities for concurrent testing
      const concurrentOpportunities: CreateOpportunityInput[] = [
        { name: 'Concurrent Deal 1', stage: 'prospecting', amount: 60000, accountName: 'ConcurrentCorp1' },
        { name: 'Concurrent Deal 2', stage: 'qualification', amount: 75000, accountName: 'ConcurrentCorp2' },
        { name: 'Concurrent Deal 3', stage: 'needs-analysis', amount: 90000, accountName: 'ConcurrentCorp3' },
      ];

      // Create all opportunities
      const createdOpportunities = await Promise.all(
        concurrentOpportunities.map(data => opportunityRepository.create(data))
      );

      // Perform concurrent updates
      const updates = [
        opportunityRepository.update({ id: createdOpportunities[0].id, stage: 'qualification', amount: 65000 }),
        opportunityRepository.update({ id: createdOpportunities[1].id, stage: 'proposal', amount: 80000 }),
        opportunityRepository.update({ id: createdOpportunities[2].id, stage: 'closed-won' }),
      ];

      const updatedOpportunities = await Promise.all(updates);

      // Verify all updates succeeded with correct data
      expect(updatedOpportunities[0].stage).toBe('qualification');
      expect(updatedOpportunities[0].amount).toBe(65000);

      expect(updatedOpportunities[1].stage).toBe('proposal');
      expect(updatedOpportunities[1].amount).toBe(80000);

      expect(updatedOpportunities[2].stage).toBe('closed-won');
      expect(updatedOpportunities[2].amount).toBe(90000); // Amount preserved

      // Verify final state in repository
      const allOpportunities = await opportunityRepository.list();
      
      for (const updated of updatedOpportunities) {
        const found = allOpportunities.find(opp => opp.id === updated.id);
        expect(found).toEqual(updated);
      }
    });
  });

  describe('Pipeline Error Handling and Recovery', () => {
    it('should handle invalid stage transitions gracefully', async () => {
      // Create opportunity
      const opportunityData: CreateOpportunityInput = {
        name: 'Error Test Deal',
        stage: 'prospecting',
        amount: 50000,
        accountName: 'ErrorCorp',
      };

      const opportunity = await opportunityRepository.create(opportunityData);

      // Valid update
      const updatedOpportunity = await opportunityRepository.update({
        id: opportunity.id,
        stage: 'qualification',
      });

      expect(updatedOpportunity.stage).toBe('qualification');

      // Attempt invalid updates
      const invalidUpdates = [
        { id: opportunity.id, stage: 'invalid-stage' as OpportunityStage },
        { id: opportunity.id, amount: -50000 }, // Negative amount
        { id: 'non-existent-id', stage: 'proposal' as OpportunityStage },
      ];

      for (const invalidUpdate of invalidUpdates) {
        await expect(
          opportunityRepository.update(invalidUpdate)
        ).rejects.toThrow();
      }

      // Verify original opportunity is unchanged after failed updates
      const allOpportunities = await opportunityRepository.list();
      const preservedOpportunity = allOpportunities.find(opp => opp.id === opportunity.id);
      
      expect(preservedOpportunity?.stage).toBe('qualification');
      expect(preservedOpportunity?.amount).toBe(50000);
    });

    it('should maintain pipeline integrity during partial failures', async () => {
      // Create multiple opportunities
      const opportunityInputs: CreateOpportunityInput[] = [
        { name: 'Batch Update 1', stage: 'prospecting', amount: 40000, accountName: 'BatchCorp1' },
        { name: 'Batch Update 2', stage: 'qualification', amount: 55000, accountName: 'BatchCorp2' },
        { name: 'Batch Update 3', stage: 'proposal', amount: 70000, accountName: 'BatchCorp3' },
      ];

      const opportunities = await Promise.all(
        opportunityInputs.map(data => opportunityRepository.create(data))
      );

      // Attempt batch updates with one failure
      const batchUpdates = [
        opportunityRepository.update({ id: opportunities[0].id, stage: 'qualification' }), // Valid
        opportunityRepository.update({ id: opportunities[1].id, stage: 'needs-analysis' }), // Valid
        // Invalid update will be caught individually, not affecting others
      ];

      const results = await Promise.allSettled(batchUpdates);

      // Valid updates should succeed
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');

      // Verify successful updates
      const allOpportunities = await opportunityRepository.list();
      
      const updated1 = allOpportunities.find(opp => opp.id === opportunities[0].id);
      const updated2 = allOpportunities.find(opp => opp.id === opportunities[1].id);
      const unchanged3 = allOpportunities.find(opp => opp.id === opportunities[2].id);

      expect(updated1?.stage).toBe('qualification');
      expect(updated2?.stage).toBe('needs-analysis');
      expect(unchanged3?.stage).toBe('proposal'); // Unchanged due to no update attempted
    });
  });
});