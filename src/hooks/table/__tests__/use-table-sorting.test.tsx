import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableSorting } from '../use-table-sorting';

describe('useTableSorting', () => {
  it('should initialize with empty sorting by default', () => {
    const { result } = renderHook(() => useTableSorting());

    expect(result.current.sorting).toEqual([]);
  });

  it('should initialize with provided initial sorting', () => {
    const initialSorting = [{ id: 'name', desc: false }];
    const { result } = renderHook(() => useTableSorting({ initialSorting }));

    expect(result.current.sorting).toEqual(initialSorting);
  });

  it('should update sorting state', () => {
    const { result } = renderHook(() => useTableSorting());

    const newSorting = [{ id: 'score', desc: true }];

    act(() => {
      result.current.setSorting(newSorting);
    });

    expect(result.current.sorting).toEqual(newSorting);
  });

  it('should handle function-based sorting updates', () => {
    const initialSorting = [{ id: 'name', desc: false }];
    const { result } = renderHook(() => useTableSorting({ initialSorting }));

    act(() => {
      result.current.setSorting((prev) => [
        ...prev,
        { id: 'score', desc: true }
      ]);
    });

    expect(result.current.sorting).toEqual([
      { id: 'name', desc: false },
      { id: 'score', desc: true }
    ]);
  });
});