import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditOpportunityDialog } from '../edit-opportunity-dialog';
import type { Opportunity } from '../../../model/opportunity';

const mockOpportunity: Opportunity = {
  id: 'opp-1',
  name: 'Test Opportunity',
  accountName: 'Test Account',
  stage: 'proposal',
  amount: 50000,
  leadId: 'lead-1',
};

const defaultProps = {
  opportunity: mockOpportunity,
  isOpen: true,
  onClose: vi.fn(),
  onUpdate: vi.fn(),
  isLoading: false,
};

// Mock the sheet component
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="sheet-title">{children}</h2>,
}));

describe('EditOpportunityDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with opportunity data', () => {
    render(<EditOpportunityDialog {...defaultProps} />);
    
    expect(screen.getByText('Edit Opportunity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Opportunity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Account')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
  });

  it('should show all stages including closed-won/lost', () => {
    render(<EditOpportunityDialog {...defaultProps} />);
    
    // Should have ALL stages in DOM (including final ones)
    expect(screen.getByText('Closed Won')).toBeInTheDocument();
    expect(screen.getByText('Closed Lost')).toBeInTheDocument();
    expect(screen.getByText('Negotiation')).toBeInTheDocument();
  });

  it('should have update button available', () => {
    render(<EditOpportunityDialog {...defaultProps} />);
    
    // Should have update button
    const submitButton = screen.getByRole('button', { name: /update opportunity/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  });

  it('should not render when no opportunity provided', () => {
    render(<EditOpportunityDialog {...defaultProps} opportunity={null} />);
    
    expect(screen.queryByText('Edit Opportunity')).not.toBeInTheDocument();
  });
});