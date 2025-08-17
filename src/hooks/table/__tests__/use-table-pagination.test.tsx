import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTablePagination } from '../use-table-pagination';

describe('useTablePagination', () => {
  it('should initialize with default pagination', () => {
    const { result } = renderHook(() => useTablePagination());

    expect(result.current.pagination).toEqual({
      pageIndex: 0,
      pageSize: 10,
    });
  });

  it('should initialize with custom page size', () => {
    const { result } = renderHook(() => useTablePagination({ initialPageSize: 25 }));

    expect(result.current.pagination).toEqual({
      pageIndex: 0,
      pageSize: 25,
    });
  });

  it('should update pagination state', () => {
    const { result } = renderHook(() => useTablePagination());

    const newPagination = { pageIndex: 2, pageSize: 20 };

    act(() => {
      result.current.setPagination(newPagination);
    });

    expect(result.current.pagination).toEqual(newPagination);
  });

  it('should handle function-based pagination updates', () => {
    const { result } = renderHook(() => useTablePagination());

    act(() => {
      result.current.setPagination((prev) => ({
        ...prev,
        pageIndex: prev.pageIndex + 1,
      }));
    });

    expect(result.current.pagination).toEqual({
      pageIndex: 1,
      pageSize: 10,
    });
  });
});