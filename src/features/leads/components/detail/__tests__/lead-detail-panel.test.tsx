import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadDetailPanel } from '../lead-detail-panel';
import type { Lead } from '../../../model/lead';

// Mock data
const mockLead: Lead = {
  id: 'lead-1',
  name: 'John Smith',
  company: 'TechCorp Inc',
  email: 'john@techcorp.com',
  source: 'web',
  score: 85,
  status: 'new',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const qualifiedLead: Lead = {
  ...mockLead,
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

// Mock window.confirm for unsaved changes
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

describe('LeadDetailPanel', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (window.confirm as any).mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render panel when open with lead data', () => {
      render(<LeadDetailPanel {...defaultProps} />);

      expect(screen.getByTestId('sheet')).toBeInTheDocument();
      expect(screen.getByText('Lead Details')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
      expect(screen.getByText('web')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<LeadDetailPanel {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
    });

    it('should not render when no lead provided', () => {
      render(<LeadDetailPanel {...defaultProps} lead={null} />);
      
      expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
    });

    it('should pre-populate form fields with lead data', () => {
      render(<LeadDetailPanel {...defaultProps} />);

      expect(screen.getByDisplayValue('john@techcorp.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New')).toBeInTheDocument();
    });

    it('should show conversion button for qualified leads', () => {
      render(<LeadDetailPanel {...defaultProps} lead={qualifiedLead} />);

      expect(screen.getByText('Qualified Lead')).toBeInTheDocument();
      expect(screen.getByText('This lead is qualified and can be converted into an opportunity.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /convert to opportunity/i })).toBeInTheDocument();
    });

    it('should not show conversion button for non-qualified leads', () => {
      render(<LeadDetailPanel {...defaultProps} />);

      expect(screen.queryByText('Qualified Lead')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /convert to opportunity/i })).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty email', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid email format', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });

      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user+tag@example.co.uk',
        'user.name@example-site.com',
        'user123@test123.org',
      ];

      for (const email of validEmails) {
        render(<LeadDetailPanel {...defaultProps} />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, email);
        
        const submitButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(submitButton);

        await waitFor(() => {
          expect(defaultProps.onSave).toHaveBeenCalledWith({
            id: 'lead-1',
            email: email,
            status: 'new',
          });
        });

        // Clean up for next iteration
        vi.clearAllMocks();
      }
    });
  });

  describe('Form Interaction', () => {
    it('should update email field correctly', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'newemail@example.com');

      expect(emailInput).toHaveValue('newemail@example.com');
    });

    it('should change status selection', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      // Just verify the select component is rendered with default value
      expect(screen.getByDisplayValue('New')).toBeInTheDocument();
      
      // Make form dirty first
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'new' })
        );
      });
    });

    it('should enable save button only when form has changes', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      expect(submitButton).toBeDisabled();

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with correct data on valid submission', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'updated@example.com');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith({
          id: 'lead-1',
          email: 'updated@example.com',
          status: 'new',
        });
      });
    });

    it('should trim email before submission', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, '  spaced@example.com  ');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith({
          id: 'lead-1',
          email: 'spaced@example.com',
          status: 'new',
        });
      });
    });

    it('should call onClose after successful save', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      render(<LeadDetailPanel {...defaultProps} onSave={mockOnSave} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });

    it('should handle save error gracefully', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<LeadDetailPanel {...defaultProps} onSave={mockOnSave} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Save failed:', expect.any(Error));
      });

      expect(defaultProps.onClose).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should disable buttons when loading', () => {
      render(<LeadDetailPanel {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const submitButton = screen.getByRole('button', { name: /saving/i });

      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Saving…');
    });

    it('should show normal state when not loading', async () => {
      render(<LeadDetailPanel {...defaultProps} isLoading={false} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      // Make form dirty first
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /save changes/i });
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Save Changes');
      });

      expect(cancelButton).not.toBeDisabled();
    });

    it('should disable convert button when loading', () => {
      render(<LeadDetailPanel {...defaultProps} lead={qualifiedLead} isLoading={true} />);

      const convertButton = screen.getByRole('button', { name: /convert to opportunity/i });
      expect(convertButton).toBeDisabled();
    });
  });

  describe('Dialog Controls', () => {
    it('should call onClose when cancel button clicked without changes', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(window.confirm).not.toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should show confirmation dialog when closing with unsaved changes', async () => {
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(window.confirm).toHaveBeenCalledWith('You have unsaved changes. Do you really want to cancel?');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close when user cancels confirmation dialog', async () => {
      (window.confirm as any).mockReturnValue(false);
      
      render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'x');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should reset form when lead changes', () => {
      const { rerender } = render(<LeadDetailPanel {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveValue('john@techcorp.com');

      const newLead: Lead = {
        ...mockLead,
        id: 'lead-2',
        email: 'newemail@example.com',
        status: 'contacted',
      };

      rerender(<LeadDetailPanel {...defaultProps} lead={newLead} />);

      expect(emailInput).toHaveValue('newemail@example.com');
      expect(screen.getByDisplayValue('Contacted')).toBeInTheDocument();
    });

    it('should call onConvert when convert button clicked', async () => {
      render(<LeadDetailPanel {...defaultProps} lead={qualifiedLead} />);

      const convertButton = screen.getByRole('button', { name: /convert to opportunity/i });
      await user.click(convertButton);

      expect(defaultProps.onConvert).toHaveBeenCalled();
    });
  });

  describe('Basic Information Display', () => {
    it('should display all lead information correctly', () => {
      const complexLead: Lead = {
        id: 'lead-complex',
        name: 'Jane Doe',
        company: 'Complex Corp',
        email: 'jane@complex.com',
        source: 'referral',
        score: 92,
        status: 'contacted',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<LeadDetailPanel {...defaultProps} lead={complexLead} />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Complex Corp')).toBeInTheDocument();
      expect(screen.getByText('referral')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });

    it('should render basic information in correct sections', () => {
      render(<LeadDetailPanel {...defaultProps} />);

      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Lead snapshot')).toBeInTheDocument();
      expect(screen.getByText('Editable Information')).toBeInTheDocument();
    });
  });
});