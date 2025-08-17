import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeadSelection } from '../use-lead-selection';

describe('useLeadSelection', () => {
  const mockLead = {
    id: '1',
    name: 'Test Lead',
    company: 'Test Company',
    email: 'test@example.com',
    source: 'web' as const,
    score: 85,
    status: 'new' as const,
  };

  it('should initialize with no selected lead and closed panel', () => {
    const { result } = renderHook(() => useLeadSelection());

    expect(result.current.selectedLead).toBeNull();
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('should select lead and open panel', () => {
    const { result } = renderHook(() => useLeadSelection());

    act(() => {
      result.current.selectLead(mockLead);
    });

    expect(result.current.selectedLead).toEqual(mockLead);
    expect(result.current.isPanelOpen).toBe(true);
  });

  it('should close lead and panel', () => {
    const { result } = renderHook(() => useLeadSelection());

    // First select a lead
    act(() => {
      result.current.selectLead(mockLead);
    });

    // Then close it
    act(() => {
      result.current.closeLead();
    });

    expect(result.current.selectedLead).toBeNull();
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('should handle selecting null lead', () => {
    const { result } = renderHook(() => useLeadSelection());

    // First select a lead
    act(() => {
      result.current.selectLead(mockLead);
    });

    // Then select null
    act(() => {
      result.current.selectLead(null);
    });

    expect(result.current.selectedLead).toBeNull();
    expect(result.current.isPanelOpen).toBe(false);
  });
});