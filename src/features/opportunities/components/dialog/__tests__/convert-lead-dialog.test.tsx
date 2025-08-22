import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvertLeadDialog } from '../convert-lead-dialog';
import type { Lead } from '../../../../leads/model/lead';

const mockLead: Lead = {
  id: 'lead-1',
  name: 'John Smith',
  company: 'TechCorp Inc',
  email: 'john@techcorp.com',
  source: 'web',
  score: 85,
  status: 'qualified',
};

const defaultProps = {
  lead: mockLead,
  isOpen: true,
  onClose: vi.fn(),
  onConvert: vi.fn(),
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

describe('ConvertLeadDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with lead data', () => {
    render(<ConvertLeadDialog {...defaultProps} />);
    
    expect(screen.getByText('Convert Lead to Opportunity')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ConvertLeadDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Convert Lead to Opportunity')).not.toBeInTheDocument();
  });

  it('should pre-populate form with lead data', () => {
    render(<ConvertLeadDialog {...defaultProps} />);
    
    expect(screen.getByDisplayValue('TechCorp Inc - Opportunity')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TechCorp Inc')).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    render(<ConvertLeadDialog {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
    await user.click(submitButton);

    expect(defaultProps.onConvert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'TechCorp Inc - Opportunity',
        accountName: 'TechCorp Inc',
        stage: 'prospecting',
        leadId: 'lead-1',
      })
    );
  });

  it('should call onClose when cancel is clicked', async () => {
    render(<ConvertLeadDialog {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    render(<ConvertLeadDialog {...defaultProps} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /converting/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('should only show initial stages (not closed-won/lost)', () => {
    render(<ConvertLeadDialog {...defaultProps} />);
    
    // Should NOT have final stages anywhere in DOM
    expect(screen.queryByText('Closed Won')).not.toBeInTheDocument();
    expect(screen.queryByText('Closed Lost')).not.toBeInTheDocument();
    expect(screen.queryByText('Negotiation')).not.toBeInTheDocument();
    
    // Should have convert dialog title
    expect(screen.getByText('Convert Lead to Opportunity')).toBeInTheDocument();
  });
});