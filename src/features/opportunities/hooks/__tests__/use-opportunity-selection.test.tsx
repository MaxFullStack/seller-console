import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOpportunitySelection } from '../use-opportunity-selection';

describe('useOpportunitySelection', () => {
  const mockOpportunity = {
    id: '1',
    name: 'Test Opportunity',
    stage: 'prospecting' as const,
    accountName: 'Test Company',
    amount: 50000,
    leadId: 'lead-1',
  };

  it('should initialize with no selected opportunity and closed panel', () => {
    const { result } = renderHook(() => useOpportunitySelection());

    expect(result.current.selectedOpportunity).toBeNull();
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('should select opportunity and open panel', () => {
    const { result } = renderHook(() => useOpportunitySelection());

    act(() => {
      result.current.selectOpportunity(mockOpportunity);
    });

    expect(result.current.selectedOpportunity).toEqual(mockOpportunity);
    expect(result.current.isPanelOpen).toBe(true);
  });

  it('should close opportunity and panel', () => {
    const { result } = renderHook(() => useOpportunitySelection());

    // First select an opportunity
    act(() => {
      result.current.selectOpportunity(mockOpportunity);
    });

    // Then close it
    act(() => {
      result.current.closeOpportunity();
    });

    expect(result.current.selectedOpportunity).toBeNull();
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('should handle selecting null opportunity', () => {
    const { result } = renderHook(() => useOpportunitySelection());

    // First select an opportunity
    act(() => {
      result.current.selectOpportunity(mockOpportunity);
    });

    // Then select null
    act(() => {
      result.current.selectOpportunity(null);
    });

    expect(result.current.selectedOpportunity).toBeNull();
    expect(result.current.isPanelOpen).toBe(false);
  });
});