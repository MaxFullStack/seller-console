import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableFilters } from '../use-table-filters';

describe('useTableFilters', () => {
  it('should initialize with empty column filters', () => {
    const { result } = renderHook(() => useTableFilters());

    expect(result.current.columnFilters).toEqual([]);
  });

  it('should update column filters state', () => {
    const { result } = renderHook(() => useTableFilters());

    const newFilters = [{ id: 'name', value: 'test' }];

    act(() => {
      result.current.setColumnFilters(newFilters);
    });

    expect(result.current.columnFilters).toEqual(newFilters);
  });

  it('should handle function-based filter updates', () => {
    const { result } = renderHook(() => useTableFilters());

    const initialFilters = [{ id: 'name', value: 'test' }];

    act(() => {
      result.current.setColumnFilters(initialFilters);
    });

    act(() => {
      result.current.setColumnFilters((prev) => [
        ...prev,
        { id: 'status', value: 'active' }
      ]);
    });

    expect(result.current.columnFilters).toEqual([
      { id: 'name', value: 'test' },
      { id: 'status', value: 'active' }
    ]);
  });
});