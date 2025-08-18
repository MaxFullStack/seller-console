import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLeadsMetrics } from '../use-leads-metrics';
import type { Lead } from '@/features/leads/model/lead';
import { useDashboardStore } from '@/store/dashboard-store';

// Mock the dashboard store
vi.mock('@/store/dashboard-store', () => ({
  useDashboardStore: vi.fn(),
}));

const mockUseDashboardStore = vi.mocked(useDashboardStore);

describe('useLeadsMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('with empty leads data', () => {
    it('should return zero metrics when no leads exist', () => {
      mockUseDashboardStore.mockReturnValue([]);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current).toEqual({
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 0,
        conversionRate: 0,
      });
    });
  });

  describe('with single lead', () => {
    it('should calculate metrics correctly for one new lead', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'John Doe',
          company: 'TechCorp',
          email: 'john@techcorp.com',
          source: 'web',
          score: 85,
          status: 'new',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current).toEqual({
        totalLeads: 1,
        newLeads: 1,
        qualifiedLeads: 0,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 85,
        conversionRate: 0, // No qualified leads
      });
    });

    it('should calculate metrics correctly for one qualified lead', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'Jane Smith',
          company: 'DataCorp',
          email: 'jane@datacorp.com',
          source: 'email',
          score: 92,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current).toEqual({
        totalLeads: 1,
        newLeads: 0,
        qualifiedLeads: 1,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: 92,
        conversionRate: 100, // 1/1 * 100
      });
    });
  });

  describe('with multiple leads', () => {
    it('should calculate metrics correctly for diverse lead statuses', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'Lead 1',
          company: 'Company 1',
          email: 'lead1@company1.com',
          source: 'web',
          score: 80,
          status: 'new',
        },
        {
          id: '2',
          name: 'Lead 2',
          company: 'Company 2',
          email: 'lead2@company2.com',
          source: 'email',
          score: 90,
          status: 'qualified',
        },
        {
          id: '3',
          name: 'Lead 3',
          company: 'Company 3',
          email: 'lead3@company3.com',
          source: 'referral',
          score: 60,
          status: 'contacted',
        },
        {
          id: '4',
          name: 'Lead 4',
          company: 'Company 4',
          email: 'lead4@company4.com',
          source: 'social',
          score: 40,
          status: 'unqualified',
        },
        {
          id: '5',
          name: 'Lead 5',
          company: 'Company 5',
          email: 'lead5@company5.com',
          source: 'phone',
          score: 95,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current).toEqual({
        totalLeads: 5,
        newLeads: 1,
        qualifiedLeads: 2,
        unqualifiedLeads: 1,
        contactedLeads: 1,
        averageLeadScore: Math.round((80 + 90 + 60 + 40 + 95) / 5), // 73
        conversionRate: Math.round((2 / 5) * 100), // 40
      });
    });

    it('should handle edge case scores correctly', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'Min Score Lead',
          company: 'Company 1',
          email: 'min@company1.com',
          source: 'web',
          score: 0,
          status: 'new',
        },
        {
          id: '2',
          name: 'Max Score Lead',
          company: 'Company 2',
          email: 'max@company2.com',
          source: 'email',
          score: 100,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current).toEqual({
        totalLeads: 2,
        newLeads: 1,
        qualifiedLeads: 1,
        unqualifiedLeads: 0,
        contactedLeads: 0,
        averageLeadScore: Math.round((0 + 100) / 2), // 50
        conversionRate: Math.round((1 / 2) * 100), // 50
      });
    });
  });

  describe('score calculations', () => {
    it('should round average score correctly', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'Lead 1',
          company: 'Company 1',
          email: 'lead1@company1.com',
          source: 'web',
          score: 33,
          status: 'new',
        },
        {
          id: '2',
          name: 'Lead 2',
          company: 'Company 2',
          email: 'lead2@company2.com',
          source: 'email',
          score: 33,
          status: 'qualified',
        },
        {
          id: '3',
          name: 'Lead 3',
          company: 'Company 3',
          email: 'lead3@company3.com',
          source: 'referral',
          score: 34,
          status: 'contacted',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      // (33 + 33 + 34) / 3 = 33.33... should round to 33
      expect(result.current.averageLeadScore).toBe(33);
    });
  });

  describe('conversion rate calculations', () => {
    it('should calculate conversion rate as integer percentage', () => {
      // Test various scenarios to ensure proper rounding
      const testCases = [
        { qualified: 1, total: 3, expected: 33 }, // 33.33... -> 33
        { qualified: 2, total: 3, expected: 67 }, // 66.66... -> 67
        { qualified: 1, total: 6, expected: 17 }, // 16.66... -> 17
        { qualified: 5, total: 6, expected: 83 }, // 83.33... -> 83
      ];

      testCases.forEach(({ qualified, total, expected }) => {
        const leads: Lead[] = [];
        
        // Add qualified leads
        for (let i = 0; i < qualified; i++) {
          leads.push({
            id: `qualified-${i}`,
            name: `Qualified Lead ${i}`,
            company: `Company ${i}`,
            email: `qualified${i}@company.com`,
            source: 'web',
            score: 90,
            status: 'qualified',
          });
        }
        
        // Add remaining leads as new
        for (let i = qualified; i < total; i++) {
          leads.push({
            id: `new-${i}`,
            name: `New Lead ${i}`,
            company: `Company ${i}`,
            email: `new${i}@company.com`,
            source: 'web',
            score: 80,
            status: 'new',
          });
        }

        mockUseDashboardStore.mockReturnValue(leads);

        const { result } = renderHook(() => useLeadsMetrics());

        expect(result.current.conversionRate).toBe(expected);
      });
    });

    it('should handle 100% conversion rate', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'Qualified Lead 1',
          company: 'Company 1',
          email: 'q1@company1.com',
          source: 'web',
          score: 90,
          status: 'qualified',
        },
        {
          id: '2',
          name: 'Qualified Lead 2',
          company: 'Company 2',
          email: 'q2@company2.com',
          source: 'email',
          score: 95,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current.conversionRate).toBe(100);
    });

    it('should handle 0% conversion rate', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'New Lead 1',
          company: 'Company 1',
          email: 'n1@company1.com',
          source: 'web',
          score: 80,
          status: 'new',
        },
        {
          id: '2',
          name: 'Contacted Lead 2',
          company: 'Company 2',
          email: 'c2@company2.com',
          source: 'email',
          score: 75,
          status: 'contacted',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result } = renderHook(() => useLeadsMetrics());

      expect(result.current.conversionRate).toBe(0);
    });
  });

  describe('memoization', () => {
    it('should memoize results when leads data does not change', () => {
      const leads: Lead[] = [
        {
          id: '1',
          name: 'Test Lead',
          company: 'Test Company',
          email: 'test@company.com',
          source: 'web',
          score: 85,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockReturnValue(leads);

      const { result, rerender } = renderHook(() => useLeadsMetrics());
      const firstResult = result.current;

      rerender();
      const secondResult = result.current;

      // Should be the same object reference due to useMemo
      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when leads data changes', () => {
      const initialLeads: Lead[] = [
        {
          id: '1',
          name: 'Initial Lead',
          company: 'Initial Company',
          email: 'initial@company.com',
          source: 'web',
          score: 80,
          status: 'new',
        },
      ];

      const updatedLeads: Lead[] = [
        ...initialLeads,
        {
          id: '2',
          name: 'New Lead',
          company: 'New Company',
          email: 'new@company.com',
          source: 'email',
          score: 90,
          status: 'qualified',
        },
      ];

      mockUseDashboardStore.mockReturnValue(initialLeads);

      const { result, rerender } = renderHook(() => useLeadsMetrics());
      const firstResult = result.current;

      expect(firstResult.totalLeads).toBe(1);
      expect(firstResult.qualifiedLeads).toBe(0);

      // Change the mock return value
      mockUseDashboardStore.mockReturnValue(updatedLeads);
      rerender();

      const secondResult = result.current;

      expect(secondResult.totalLeads).toBe(2);
      expect(secondResult.qualifiedLeads).toBe(1);
      expect(firstResult).not.toBe(secondResult); // Should be different object
    });
  });
});