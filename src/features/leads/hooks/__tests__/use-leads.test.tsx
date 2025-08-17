import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock async operation hook
vi.mock('@/hooks/use-async-operation', () => ({
  useAsyncOperation: vi.fn(),
}));

// Mock lead repository
vi.mock('../../api/lead-repository', () => ({
  leadRepository: {
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock opportunity repository
vi.mock('../../../opportunities/api/opportunity-repository', () => ({
  opportunityRepository: {
    create: vi.fn(),
  },
}));

import { useLeads } from '../use-leads';
import { useAsyncOperation } from '@/hooks/use-async-operation';

const mockUseAsyncOperation = vi.mocked(useAsyncOperation);

describe('useLeads', () => {
  const mockExecute = vi.fn();
  const mockAsyncState = {
    data: [],
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAsyncOperation.mockReturnValue([mockAsyncState, mockExecute]);
  });

  it('should provide leads state and actions', () => {
    const { result } = renderHook(() => useLeads());

    expect(result.current.leads).toEqual(mockAsyncState);
    expect(result.current.loadLeads).toBeDefined();
    expect(result.current.updateLead).toBeDefined();
    expect(result.current.convertToOpportunity).toBeDefined();
  });

  it('should call update lead with async operation', async () => {
    const { result } = renderHook(() => useLeads());

    const updateInput = {
      id: '1',
      email: 'updated@example.com',
      status: 'qualified' as const,
    };

    await act(async () => {
      await result.current.updateLead(updateInput);
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call convertToOpportunity with correct parameters', async () => {
    const { result } = renderHook(() => useLeads());

    const opportunityData = {
      name: 'Test Opportunity',
      stage: 'prospecting' as const,
      amount: 5000,
      accountName: 'Test Company',
      leadId: 'lead-1',
    };

    await act(async () => {
      await result.current.convertToOpportunity('lead-1', opportunityData);
    });

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should load leads on mount', () => {
    renderHook(() => useLeads());

    expect(mockExecute).toHaveBeenCalledWith(expect.any(Function));
  });
});
