import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOpportunityFilters } from '../use-opportunity-filters';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useOpportunityFilters', () => {
  const mockOpportunities = [
    {
      id: '1',
      name: 'TechCorp Deal',
      stage: 'prospecting' as const,
      accountName: 'TechCorp',
      amount: 50000,
      leadId: 'lead-1',
    },
    {
      id: '2',
      name: 'DataFlow Analytics',
      stage: 'proposal' as const,
      accountName: 'DataFlow',
      amount: 75000,
      leadId: 'lead-2',
    },
    {
      id: '3',
      name: 'CloudSys Integration',
      stage: 'negotiation' as const,
      accountName: 'CloudSys',
      amount: 120000,
      leadId: 'lead-3',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    expect(result.current.filters).toEqual({
      search: '',
      stage: 'all',
    });
    expect(result.current.filteredOpportunities).toEqual(mockOpportunities);
  });

  it('should load filters from localStorage', () => {
    const savedFilters = { search: 'TechCorp', stage: 'prospecting' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFilters));

    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    expect(result.current.filters).toEqual(savedFilters);
  });

  it('should filter opportunities by search term', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    act(() => {
      result.current.updateSearch('TechCorp');
    });

    expect(result.current.filteredOpportunities).toHaveLength(1);
    expect(result.current.filteredOpportunities[0].name).toBe('TechCorp Deal');
  });

  it('should filter opportunities by account name', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    act(() => {
      result.current.updateSearch('DataFlow');
    });

    expect(result.current.filteredOpportunities).toHaveLength(1);
    expect(result.current.filteredOpportunities[0].accountName).toBe('DataFlow');
  });

  it('should filter opportunities by stage', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    act(() => {
      result.current.updateStage('proposal');
    });

    expect(result.current.filteredOpportunities).toHaveLength(1);
    expect(result.current.filteredOpportunities[0].stage).toBe('proposal');
  });

  it('should combine search and stage filters', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    act(() => {
      result.current.updateSearch('DataFlow');
      result.current.updateStage('proposal');
    });

    expect(result.current.filteredOpportunities).toHaveLength(1);
    expect(result.current.filteredOpportunities[0].name).toBe('DataFlow Analytics');
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    // Set some filters first
    act(() => {
      result.current.updateSearch('TechCorp');
      result.current.updateStage('prospecting');
    });

    // Then clear them
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      search: '',
      stage: 'all',
    });
    expect(result.current.filteredOpportunities).toEqual(mockOpportunities);
  });

  it('should save filters to localStorage', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    act(() => {
      result.current.updateSearch('test');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'opportunities-filters',
      JSON.stringify({ search: 'test', stage: 'all' })
    );
  });

  it('should handle case insensitive search', () => {
    const { result } = renderHook(() => useOpportunityFilters(mockOpportunities));

    act(() => {
      result.current.updateSearch('techcorp');
    });

    expect(result.current.filteredOpportunities).toHaveLength(1);
    expect(result.current.filteredOpportunities[0].name).toBe('TechCorp Deal');
  });
});