import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpportunitiesTable } from '../opportunities-table';
import type { Opportunity } from '../../../model/opportunity';

const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    name: 'Test Opportunity',
    accountName: 'Test Account',
    stage: 'proposal',
    amount: 50000,
    leadId: 'lead-1',
  },
];

const defaultProps = {
  opportunities: mockOpportunities,
  loading: false,
  error: null,
  onClearFilters: vi.fn(),
  onEdit: vi.fn(),
};

describe('OpportunitiesTable', () => {
  const user = userEvent.setup();

  it('should render edit button and call onEdit when clicked', async () => {
    render(<OpportunitiesTable {...defaultProps} />);
    
    // Find edit button
    const editButton = screen.getByRole('button', { name: /edit opportunity/i });
    expect(editButton).toBeInTheDocument();
    
    // Click edit button
    await user.click(editButton);
    
    // Should call onEdit with the opportunity
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockOpportunities[0]);
  });
});