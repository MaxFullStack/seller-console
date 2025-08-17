import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableEmpty } from '../table-empty';

// Mock the table components
vi.mock('@/components/ui/table', () => ({
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableCell: ({ children, colSpan, className }: { children: React.ReactNode; colSpan?: number; className?: string }) => (
    <td colSpan={colSpan} className={className}>{children}</td>
  ),
}));

describe('TableEmpty', () => {
  it('should render default empty message', () => {
    render(
      <table>
        <tbody>
          <TableEmpty colSpan={3} />
        </tbody>
      </table>
    );

    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    render(
      <table>
        <tbody>
          <TableEmpty colSpan={3} message="No data available" />
        </tbody>
      </table>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should set correct colSpan', () => {
    render(
      <table>
        <tbody>
          <TableEmpty colSpan={5} />
        </tbody>
      </table>
    );

    const cell = screen.getByText('No results.').closest('td');
    expect(cell).toHaveAttribute('colSpan', '5');
  });
});