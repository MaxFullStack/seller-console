import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableHeader } from '../table-header';
import { Button } from '@/components/ui/button';

describe('TableHeader', () => {
  it('should render with singular entity name', () => {
    render(
      <TableHeader
        count={1}
        entityName="item"
      />
    );

    expect(screen.getByText('1 item found')).toBeInTheDocument();
  });

  it('should render with plural entity name', () => {
    render(
      <TableHeader
        count={5}
        entityName="item"
      />
    );

    expect(screen.getByText('5 items found')).toBeInTheDocument();
  });

  it('should render with zero count', () => {
    render(
      <TableHeader
        count={0}
        entityName="item"
      />
    );

    expect(screen.getByText('0 items found')).toBeInTheDocument();
  });

  it('should render actions when provided', () => {
    const actions = (
      <Button variant="outline" size="sm">
        Test Action
      </Button>
    );

    render(
      <TableHeader
        count={1}
        entityName="item"
        actions={actions}
      />
    );

    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('should not render actions section when not provided', () => {
    render(
      <TableHeader
        count={1}
        entityName="item"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});