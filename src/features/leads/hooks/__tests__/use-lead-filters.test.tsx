import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeadFilters } from '../use-lead-filters';

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

describe('useLeadFilters', () => {
  const mockLeads = [
    {
      id: '1',
      name: 'John Doe',
      company: 'TechCorp',
      email: 'john@techcorp.com',
      source: 'web' as const,
      score: 85,
      status: 'new' as const,
    },
    {
      id: '2',
      name: 'Jane Smith',
      company: 'DataFlow',
      email: 'jane@dataflow.com',
      source: 'referral' as const,
      score: 92,
      status: 'qualified' as const,
    },
    {
      id: '3',
      name: 'Bob Wilson',
      company: 'CloudSys',
      email: 'bob@cloudsys.com',
      source: 'social' as const,
      score: 78,
      status: 'contacted' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    expect(result.current.filters).toEqual({
      search: '',
      status: 'all',
    });
    expect(result.current.filteredLeads).toEqual(mockLeads);
  });

  it('should load filters from localStorage', () => {
    const savedFilters = { search: 'John', status: 'new' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFilters));

    const { result } = renderHook(() => useLeadFilters(mockLeads));

    expect(result.current.filters).toEqual(savedFilters);
  });

  it('should filter leads by search term', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    act(() => {
      result.current.updateSearch('John');
    });

    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].name).toBe('John Doe');
  });

  it('should filter leads by company name', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    act(() => {
      result.current.updateSearch('TechCorp');
    });

    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].company).toBe('TechCorp');
  });

  it('should filter leads by status', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    act(() => {
      result.current.updateStatus('qualified');
    });

    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].status).toBe('qualified');
  });

  it('should combine search and status filters', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    act(() => {
      result.current.updateSearch('Jane');
      result.current.updateStatus('qualified');
    });

    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].name).toBe('Jane Smith');
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    // Set some filters first
    act(() => {
      result.current.updateSearch('John');
      result.current.updateStatus('new');
    });

    // Then clear them
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      search: '',
      status: 'all',
    });
    expect(result.current.filteredLeads).toEqual(mockLeads);
  });

  it('should save filters to localStorage', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    act(() => {
      result.current.updateSearch('test');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'leads-filters',
      JSON.stringify({ search: 'test', status: 'all' })
    );
  });

  it('should handle case insensitive search', () => {
    const { result } = renderHook(() => useLeadFilters(mockLeads));

    act(() => {
      result.current.updateSearch('john');
    });

    expect(result.current.filteredLeads).toHaveLength(1);
    expect(result.current.filteredLeads[0].name).toBe('John Doe');
  });
});