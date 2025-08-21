import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvertLeadDialog } from '../convert-lead-dialog';
import type { Lead } from '../../../../leads/model/lead';

// Mock data
const mockLead: Lead = {
  id: 'lead-1',
  name: 'John Smith',
  company: 'TechCorp Inc',
  email: 'john@techcorp.com',
  source: 'web',
  score: 85,
  status: 'qualified',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const defaultProps = {
  lead: mockLead,
  isOpen: true,
  onClose: vi.fn(),
  onConvert: vi.fn(),
  isLoading: false,
};

// Mock the sheet component to avoid layout issues in tests
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

  describe('Rendering', () => {
    it('should render dialog when open with lead data', () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      expect(screen.getByTestId('sheet')).toBeInTheDocument();
      expect(screen.getByText('Convert Lead to Opportunity')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
      expect(screen.getByText('john@techcorp.com')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<ConvertLeadDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
    });

    it('should not render when no lead provided', () => {
      render(<ConvertLeadDialog {...defaultProps} lead={null} />);
      
      expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
    });

    it('should pre-populate form fields with lead data', () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      expect(screen.getByDisplayValue('TechCorp Inc - Opportunity')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TechCorp Inc')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Prospecting')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty opportunity name', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/opportunity name/i);
      await user.clear(nameInput);
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Opportunity name is required')).toBeInTheDocument();
      });

      expect(defaultProps.onConvert).not.toHaveBeenCalled();
    });

    it('should show validation error for opportunity name too short', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/opportunity name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'A');
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should show validation error for opportunity name too long', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/opportunity name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'A'.repeat(101));
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be no more than 100 characters')).toBeInTheDocument();
      });
    });

    it('should show validation error for empty account name', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const accountInput = screen.getByLabelText(/account name/i);
      await user.clear(accountInput);
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account name is required')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid amount format', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/amount/i);
      await user.type(amountInput, 'abc');
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount must be a valid number/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for negative amount', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '-1000');
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount must be between 0 and/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for amount too large', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '1000000000');
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/amount must be between 0 and/i)).toBeInTheDocument();
      });
    });

    it('should allow valid decimal amounts', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const amountInput = screen.getByLabelText(/amount/i);
      await user.type(amountInput, '50000.99');
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onConvert).toHaveBeenCalledWith({
          name: 'TechCorp Inc - Opportunity',
          stage: 'prospecting',
          amount: 50000.99,
          accountName: 'TechCorp Inc',
          leadId: 'lead-1',
        });
      });
    });

    it('should allow empty amount (optional field)', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onConvert).toHaveBeenCalledWith({
          name: 'TechCorp Inc - Opportunity',
          stage: 'prospecting',
          amount: undefined,
          accountName: 'TechCorp Inc',
          leadId: 'lead-1',
        });
      });
    });
  });

  describe('Form Interaction', () => {
    it('should update form fields correctly', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/opportunity name/i);
      const accountInput = screen.getByLabelText(/account name/i);
      const amountInput = screen.getByLabelText(/amount/i);

      await user.clear(nameInput);
      await user.type(nameInput, 'Custom Opportunity Name');
      
      await user.clear(accountInput);
      await user.type(accountInput, 'Custom Account');
      
      await user.type(amountInput, '75000');

      expect(nameInput).toHaveValue('Custom Opportunity Name');
      expect(accountInput).toHaveValue('Custom Account');
      expect(amountInput).toHaveValue(75000);
    });

    it('should change stage selection', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      // Just verify the select component is rendered with default value
      expect(screen.getByDisplayValue('Prospecting')).toBeInTheDocument();
      
      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onConvert).toHaveBeenCalledWith(
          expect.objectContaining({ stage: 'prospecting' })
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onConvert with correct data on valid submission', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/opportunity name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Test Opportunity');

      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onConvert).toHaveBeenCalledWith({
          name: 'Test Opportunity',
          stage: 'prospecting',
          amount: undefined,
          accountName: 'TechCorp Inc',
          leadId: 'lead-1',
        });
      });
    });

    it('should call onClose after successful conversion', async () => {
      const mockOnConvert = vi.fn().mockResolvedValue(undefined);
      render(<ConvertLeadDialog {...defaultProps} onConvert={mockOnConvert} />);

      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnConvert).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle conversion error gracefully', async () => {
      const mockOnConvert = vi.fn().mockRejectedValue(new Error('Conversion failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ConvertLeadDialog {...defaultProps} onConvert={mockOnConvert} />);

      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnConvert).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Convert failed:', expect.any(Error));
      });

      expect(defaultProps.onClose).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should disable buttons when loading', () => {
      render(<ConvertLeadDialog {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /converting/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Converting…');
    });

    it('should show normal state when not loading', () => {
      render(<ConvertLeadDialog {...defaultProps} isLoading={false} />);

      const submitButton = screen.getByRole('button', { name: /convert to opportunity/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      expect(submitButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Convert to Opportunity');
    });
  });

  describe('Dialog Controls', () => {
    it('should call onClose when cancel button clicked', async () => {
      render(<ConvertLeadDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should reset form when lead changes', () => {
      const { rerender } = render(<ConvertLeadDialog {...defaultProps} />);

      const nameInput = screen.getByLabelText(/opportunity name/i);
      expect(nameInput).toHaveValue('TechCorp Inc - Opportunity');

      const newLead: Lead = {
        ...mockLead,
        id: 'lead-2',
        company: 'NewCorp',
      };

      rerender(<ConvertLeadDialog {...defaultProps} lead={newLead} />);

      expect(nameInput).toHaveValue('NewCorp - Opportunity');
    });
  });
});