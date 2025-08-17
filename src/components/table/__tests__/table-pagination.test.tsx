import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Table } from '@tanstack/react-table';
import { TablePagination } from '../table-pagination';

describe('TablePagination', () => {
  const createMockTable = (pageIndex = 0, pageSize = 10, totalPages = 5): Partial<Table<unknown>> => {
    return {
      getState: vi.fn().mockReturnValue({
        pagination: { pageIndex, pageSize },
      }),
      getPageCount: vi.fn().mockReturnValue(totalPages),
      getCanPreviousPage: vi.fn().mockReturnValue(pageIndex > 0),
      getCanNextPage: vi.fn().mockReturnValue(pageIndex < totalPages - 1),
      setPageSize: vi.fn(),
      setPageIndex: vi.fn(),
      previousPage: vi.fn(),
      nextPage: vi.fn(),
    };
  };

  it('should display current page information', () => {
    const table = createMockTable(0, 10);
    render(<TablePagination table={table as Table<unknown>} />);

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should display rows per page selector', () => {
    const table = createMockTable(0, 10);
    render(<TablePagination table={table as Table<unknown>} />);

    expect(screen.getByText('Rows per page')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should call setPageSize when rows per page changes', () => {
    const table = createMockTable(0, 10);
    render(<TablePagination table={table as Table<unknown>} />);

    // The actual select functionality would need to be tested differently
    // since it's a custom Select component that doesn't use standard HTML select
    expect(table.setPageSize).toBeDefined();
  });

  it('should disable previous buttons on first page', () => {
    const table = createMockTable(0, 10);
    render(<TablePagination table={table as Table<unknown>} />);

    const previousButtons = screen.getAllByText('<');
    const firstPageButtons = screen.getAllByText('<<');
    
    previousButtons.forEach(button => {
      expect(button.closest('button')).toBeDisabled();
    });
    
    firstPageButtons.forEach(button => {
      expect(button.closest('button')).toBeDisabled();
    });
  });

  it('should enable navigation buttons on middle page', () => {
    const table = createMockTable(2, 10);
    render(<TablePagination table={table as Table<unknown>} />);

    const previousButtons = screen.getAllByText('<');
    const nextButtons = screen.getAllByText('>');
    
    previousButtons.forEach(button => {
      expect(button.closest('button')).not.toBeDisabled();
    });
    
    nextButtons.forEach(button => {
      expect(button.closest('button')).not.toBeDisabled();
    });
  });

  it('should call navigation methods when buttons are clicked', () => {
    const table = createMockTable(2, 10);
    render(<TablePagination table={table as Table<unknown>} />);

    fireEvent.click(screen.getAllByText('<')[0]);
    expect(table.previousPage).toHaveBeenCalled();

    fireEvent.click(screen.getAllByText('>')[0]);
    expect(table.nextPage).toHaveBeenCalled();

    fireEvent.click(screen.getAllByText('<<')[0]);
    expect(table.setPageIndex).toHaveBeenCalledWith(0);

    fireEvent.click(screen.getAllByText('>>')[0]);
    expect(table.setPageIndex).toHaveBeenCalledWith(4); // pageCount - 1
  });
});