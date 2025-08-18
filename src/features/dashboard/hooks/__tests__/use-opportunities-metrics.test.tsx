import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOpportunitiesMetrics } from '../use-opportunities-metrics';
import type { Opportunity } from '@/features/opportunities/model/opportunity';
import type { Lead } from '@/features/leads/model/lead';
import { useDashboardStore } from '@/store/dashboard-store';

// Mock the dashboard store
vi.mock('@/store/dashboard-store', () => ({
  useDashboardStore: vi.fn(),
}));

const mockUseDashboardStore = vi.mocked(useDashboardStore);

describe('useOpportunitiesMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockStoreSelector = (opportunities: Opportunity[], leads: Lead[] = []) => {
    return (selector: (state: any) => any) => {
      const mockState = { opportunities, leads };
      return selector(mockState);
    };
  };

  describe('with empty data', () => {
    it('should return zero metrics when no opportunities exist', () => {
      mockUseDashboardStore.mockImplementation(createMockStoreSelector([], []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current).toEqual({
        totalOpportunities: 0,
        totalRevenue: 0,
        averageDealSize: 0,
        totalPipelineValue: 0,
        opportunitiesByStage: {},
        opportunityConversionRate: 0,
        closedWonCount: 0,
        winRate: 0,
        activeOpportunities: 0,
      });
    });
  });

  describe('with single opportunity', () => {
    it('should calculate metrics correctly for one closed-won opportunity', () => {
      const opportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Test Deal',
          stage: 'closed-won',
          amount: 50000,
          accountName: 'Test Account',
          leadId: '1',
        },
      ];

      const leads: Lead[] = [
        {
          id: '1',
          name: 'Test Lead',
          company: 'Test Company',
          email: 'test@company.com',
          source: 'web',
          score: 90,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, leads));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current).toEqual({
        totalOpportunities: 1,
        totalRevenue: 50000,
        averageDealSize: 50000,
        totalPipelineValue: 50000,
        opportunitiesByStage: { 'closed-won': 1 },
        opportunityConversionRate: 100, // 1 closed-won / 1 qualified lead
        closedWonCount: 1,
        winRate: 100, // 1 won / 1 closed
        activeOpportunities: 0,
      });
    });

    it('should calculate metrics correctly for one active opportunity', () => {
      const opportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Active Deal',
          stage: 'proposal',
          amount: 30000,
          accountName: 'Active Account',
          leadId: '1',
        },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current).toEqual({
        totalOpportunities: 1,
        totalRevenue: 0, // No closed-won deals
        averageDealSize: 30000, // Uses pipeline average when no closed-won
        totalPipelineValue: 30000,
        opportunitiesByStage: { 'proposal': 1 },
        opportunityConversionRate: 0, // No qualified leads
        closedWonCount: 0,
        winRate: 0, // No closed deals
        activeOpportunities: 1,
      });
    });
  });

  describe('with multiple opportunities', () => {
    it('should calculate comprehensive metrics correctly', () => {
      const opportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Won Deal 1',
          stage: 'closed-won',
          amount: 100000,
          accountName: 'Account 1',
          leadId: '1',
        },
        {
          id: '2',
          name: 'Won Deal 2',
          stage: 'closed-won',
          amount: 50000,
          accountName: 'Account 2',
          leadId: '2',
        },
        {
          id: '3',
          name: 'Lost Deal',
          stage: 'closed-lost',
          amount: 75000,
          accountName: 'Account 3',
          leadId: '3',
        },
        {
          id: '4',
          name: 'Active Deal 1',
          stage: 'proposal',
          amount: 40000,
          accountName: 'Account 4',
          leadId: '4',
        },
        {
          id: '5',
          name: 'Active Deal 2',
          stage: 'negotiation',
          amount: 60000,
          accountName: 'Account 5',
          leadId: '5',
        },
      ];

      const leads: Lead[] = [
        { id: '1', name: 'Lead 1', company: 'Co 1', email: '1@co.com', source: 'web', score: 90, status: 'qualified' },
        { id: '2', name: 'Lead 2', company: 'Co 2', email: '2@co.com', source: 'web', score: 85, status: 'qualified' },
        { id: '3', name: 'Lead 3', company: 'Co 3', email: '3@co.com', source: 'web', score: 80, status: 'qualified' },
        { id: '4', name: 'Lead 4', company: 'Co 4', email: '4@co.com', source: 'web', score: 75, status: 'qualified' },
        { id: '5', name: 'Lead 5', company: 'Co 5', email: '5@co.com', source: 'web', score: 70, status: 'qualified' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, leads));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current).toEqual({
        totalOpportunities: 5,
        totalRevenue: 150000, // 100k + 50k
        averageDealSize: Math.round(150000 / 2), // 75000 (revenue / won deals)
        totalPipelineValue: 325000, // Sum of all amounts
        opportunitiesByStage: {
          'closed-won': 2,
          'closed-lost': 1,
          'proposal': 1,
          'negotiation': 1,
        },
        opportunityConversionRate: Math.round((2 / 5) * 100), // 40% (2 won / 5 qualified)
        closedWonCount: 2,
        winRate: Math.round((2 / 3) * 100), // 67% (2 won / 3 closed)
        activeOpportunities: 2, // proposal + negotiation
      });
    });
  });

  describe('amount handling', () => {
    it('should handle opportunities without amounts', () => {
      const opportunities: Opportunity[] = [
        {
          id: '1',
          name: 'No Amount Deal',
          stage: 'closed-won',
          accountName: 'Account 1',
          leadId: '1',
          // amount is undefined
        },
        {
          id: '2',
          name: 'With Amount Deal',
          stage: 'closed-won',
          amount: 100000,
          accountName: 'Account 2',
          leadId: '2',
        },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.totalRevenue).toBe(100000); // Only counts defined amounts
      expect(result.current.totalPipelineValue).toBe(100000);
      expect(result.current.averageDealSize).toBe(50000); // 100k / 2 deals
    });

    it('should handle zero amounts correctly', () => {
      const opportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Zero Amount Deal',
          stage: 'closed-won',
          amount: 0,
          accountName: 'Account 1',
          leadId: '1',
        },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.totalRevenue).toBe(0);
      expect(result.current.averageDealSize).toBe(0);
    });
  });

  describe('stage distribution', () => {
    it('should correctly count opportunities by stage', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Deal 1', stage: 'prospecting', amount: 10000, accountName: 'Account 1' },
        { id: '2', name: 'Deal 2', stage: 'prospecting', amount: 20000, accountName: 'Account 2' },
        { id: '3', name: 'Deal 3', stage: 'qualification', amount: 30000, accountName: 'Account 3' },
        { id: '4', name: 'Deal 4', stage: 'needs-analysis', amount: 40000, accountName: 'Account 4' },
        { id: '5', name: 'Deal 5', stage: 'proposal', amount: 50000, accountName: 'Account 5' },
        { id: '6', name: 'Deal 6', stage: 'proposal', amount: 60000, accountName: 'Account 6' },
        { id: '7', name: 'Deal 7', stage: 'negotiation', amount: 70000, accountName: 'Account 7' },
        { id: '8', name: 'Deal 8', stage: 'closed-won', amount: 80000, accountName: 'Account 8' },
        { id: '9', name: 'Deal 9', stage: 'closed-lost', amount: 90000, accountName: 'Account 9' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.opportunitiesByStage).toEqual({
        'prospecting': 2,
        'qualification': 1,
        'needs-analysis': 1,
        'proposal': 2,
        'negotiation': 1,
        'closed-won': 1,
        'closed-lost': 1,
      });
    });
  });

  describe('win rate calculations', () => {
    it('should calculate win rate correctly with mixed closed deals', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Won 1', stage: 'closed-won', amount: 10000, accountName: 'Account 1' },
        { id: '2', name: 'Won 2', stage: 'closed-won', amount: 20000, accountName: 'Account 2' },
        { id: '3', name: 'Won 3', stage: 'closed-won', amount: 30000, accountName: 'Account 3' },
        { id: '4', name: 'Lost 1', stage: 'closed-lost', amount: 40000, accountName: 'Account 4' },
        { id: '5', name: 'Lost 2', stage: 'closed-lost', amount: 50000, accountName: 'Account 5' },
        { id: '6', name: 'Active', stage: 'proposal', amount: 60000, accountName: 'Account 6' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.winRate).toBe(60); // 3 won / 5 closed = 60%
      expect(result.current.closedWonCount).toBe(3);
    });

    it('should handle 100% win rate', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Won 1', stage: 'closed-won', amount: 10000, accountName: 'Account 1' },
        { id: '2', name: 'Won 2', stage: 'closed-won', amount: 20000, accountName: 'Account 2' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.winRate).toBe(100);
    });

    it('should handle 0% win rate', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Lost 1', stage: 'closed-lost', amount: 10000, accountName: 'Account 1' },
        { id: '2', name: 'Lost 2', stage: 'closed-lost', amount: 20000, accountName: 'Account 2' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.winRate).toBe(0);
    });
  });

  describe('conversion rate calculations', () => {
    it('should calculate opportunity conversion rate from qualified leads', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Won Deal', stage: 'closed-won', amount: 50000, accountName: 'Account 1' },
      ];

      const leads: Lead[] = [
        { id: '1', name: 'Qualified 1', company: 'Co 1', email: '1@co.com', source: 'web', score: 90, status: 'qualified' },
        { id: '2', name: 'Qualified 2', company: 'Co 2', email: '2@co.com', source: 'web', score: 85, status: 'qualified' },
        { id: '3', name: 'Qualified 3', company: 'Co 3', email: '3@co.com', source: 'web', score: 80, status: 'qualified' },
        { id: '4', name: 'New Lead', company: 'Co 4', email: '4@co.com', source: 'web', score: 75, status: 'new' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, leads));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.opportunityConversionRate).toBe(33); // 1 won / 3 qualified = 33%
    });

    it('should handle no qualified leads', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Won Deal', stage: 'closed-won', amount: 50000, accountName: 'Account 1' },
      ];

      const leads: Lead[] = [
        { id: '1', name: 'New Lead', company: 'Co 1', email: '1@co.com', source: 'web', score: 90, status: 'new' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, leads));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.opportunityConversionRate).toBe(0);
    });
  });

  describe('active opportunities', () => {
    it('should correctly count active opportunities', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Active 1', stage: 'prospecting', amount: 10000, accountName: 'Account 1' },
        { id: '2', name: 'Active 2', stage: 'qualification', amount: 20000, accountName: 'Account 2' },
        { id: '3', name: 'Active 3', stage: 'proposal', amount: 30000, accountName: 'Account 3' },
        { id: '4', name: 'Active 4', stage: 'negotiation', amount: 40000, accountName: 'Account 4' },
        { id: '5', name: 'Won', stage: 'closed-won', amount: 50000, accountName: 'Account 5' },
        { id: '6', name: 'Lost', stage: 'closed-lost', amount: 60000, accountName: 'Account 6' },
      ];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, []));

      const { result } = renderHook(() => useOpportunitiesMetrics());

      expect(result.current.activeOpportunities).toBe(4); // Everything except closed-won and closed-lost
    });
  });

  describe('memoization', () => {
    it('should memoize results when data does not change', () => {
      const opportunities: Opportunity[] = [
        { id: '1', name: 'Test Deal', stage: 'proposal', amount: 50000, accountName: 'Test Account' },
      ];
      const leads: Lead[] = [];

      mockUseDashboardStore.mockImplementation(createMockStoreSelector(opportunities, leads));

      const { result, rerender } = renderHook(() => useOpportunitiesMetrics());
      const firstResult = result.current;

      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });
});