import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadDetailPanel } from '../lead-detail-panel';
import type { Lead } from '../../../model/lead';

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
  onSave: vi.fn(),
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

describe('LeadDetailPanel', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render panel with lead data', () => {
    render(<LeadDetailPanel {...defaultProps} />);
    
    expect(screen.getByText('Lead Details')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@techcorp.com')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<LeadDetailPanel {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Lead Details')).not.toBeInTheDocument();
  });

  it('should update email field', async () => {
    render(<LeadDetailPanel {...defaultProps} />);
    
    const emailInput = screen.getByDisplayValue('john@techcorp.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@techcorp.com');
    
    expect(emailInput).toHaveValue('newemail@techcorp.com');
  });

  it('should have save functionality available', async () => {
    render(<LeadDetailPanel {...defaultProps} />);
    
    const emailInput = screen.getByDisplayValue('john@techcorp.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@techcorp.com');
    
    // Save button should be available and enabled
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  it('should call onConvert when convert button is clicked', async () => {
    render(<LeadDetailPanel {...defaultProps} />);
    
    const convertButton = screen.getByRole('button', { name: /convert/i });
    await user.click(convertButton);

    expect(defaultProps.onConvert).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    render(<LeadDetailPanel {...defaultProps} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});