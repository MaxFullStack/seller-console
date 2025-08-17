import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock all the hooks first
const mockUpdateLead = vi.fn();
const mockConvertToOpportunity = vi.fn();
const mockSelectLead = vi.fn();
const mockCloseLead = vi.fn();
const mockUpdateSearch = vi.fn();
const mockUpdateStatus = vi.fn();
const mockOpenDialog = vi.fn();
const mockCloseDialog = vi.fn();

vi.mock('../../hooks/use-leads', () => ({
  useLeads: () => ({
    leads: {
      data: [],
      loading: false,
      error: null,
    },
    updateLead: mockUpdateLead,
    convertToOpportunity: mockConvertToOpportunity,
  }),
}));

vi.mock('../../hooks/use-lead-selection', () => ({
  useLeadSelection: () => ({
    selectedLead: null,
    isPanelOpen: false,
    selectLead: mockSelectLead,
    closeLead: mockCloseLead,
  }),
}));

vi.mock('../../hooks/use-lead-filters', () => ({
  useLeadFilters: () => ({
    filters: { search: '', status: 'all' },
    filteredLeads: [],
    updateSearch: mockUpdateSearch,
    updateStatus: mockUpdateStatus,
  }),
}));

vi.mock('../../hooks/use-convert-dialog', () => ({
  useConvertDialog: () => ({
    isOpen: false,
    openDialog: mockOpenDialog,
    closeDialog: mockCloseDialog,
  }),
}));

// Mock components with simple implementations
vi.mock('../../components/table/leads-table', () => ({
  LeadsTable: () => <div data-testid="leads-table">Leads Table</div>,
}));

vi.mock('../../components/detail/lead-detail-panel', () => ({
  LeadDetailPanel: () => <div data-testid="lead-detail-panel">Lead Detail Panel</div>,
}));

vi.mock('../../../opportunities/components/dialog/convert-lead-dialog', () => ({
  ConvertLeadDialog: () => <div data-testid="convert-dialog">Convert Dialog</div>,
}));

vi.mock('../../components/filters/lead-filters', () => ({
  default: () => <div data-testid="lead-filters">Lead Filters</div>,
}));

import { LeadsPage } from '../leads-page';

describe('LeadsPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render leads page with all main components', () => {
    render(<LeadsPage />);

    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Manage your leads and convert them to opportunities')).toBeInTheDocument();
    expect(screen.getByTestId('lead-filters')).toBeInTheDocument();
    expect(screen.getByTestId('leads-table')).toBeInTheDocument();
    expect(screen.getByTestId('lead-detail-panel')).toBeInTheDocument();
    expect(screen.getByTestId('convert-dialog')).toBeInTheDocument();
  });

  it('should not have refresh button', () => {
    render(<LeadsPage />);

    expect(screen.queryByText('Refresh')).not.toBeInTheDocument();
  });

  it('should integrate all hooks correctly', () => {
    render(<LeadsPage />);

    // Verify the page renders without errors when hooks are integrated
    expect(screen.getByText('Leads')).toBeInTheDocument();
  });
});