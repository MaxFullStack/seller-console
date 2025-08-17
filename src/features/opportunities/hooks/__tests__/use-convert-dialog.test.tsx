import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConvertDialog } from '../use-convert-dialog';

describe('useConvertDialog', () => {
  it('should initialize with closed dialog', () => {
    const { result } = renderHook(() => useConvertDialog());

    expect(result.current.isOpen).toBe(false);
  });

  it('should open dialog', () => {
    const { result } = renderHook(() => useConvertDialog());

    act(() => {
      result.current.openDialog();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close dialog', () => {
    const { result } = renderHook(() => useConvertDialog());

    // First open it
    act(() => {
      result.current.openDialog();
    });

    // Then close it
    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle dialog state correctly', () => {
    const { result } = renderHook(() => useConvertDialog());

    // Should start closed
    expect(result.current.isOpen).toBe(false);

    // Open
    act(() => {
      result.current.openDialog();
    });
    expect(result.current.isOpen).toBe(true);

    // Close
    act(() => {
      result.current.closeDialog();
    });
    expect(result.current.isOpen).toBe(false);

    // Open again
    act(() => {
      result.current.openDialog();
    });
    expect(result.current.isOpen).toBe(true);
  });
});