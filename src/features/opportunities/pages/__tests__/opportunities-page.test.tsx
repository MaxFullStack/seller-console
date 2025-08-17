import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock all the hooks first
const mockLoadOpportunities = vi.fn();
const mockCreateOpportunity = vi.fn();
const mockUpdateOpportunity = vi.fn();
const mockDeleteOpportunity = vi.fn();
const mockUpdateSearch = vi.fn();
const mockUpdateStage = vi.fn();
const mockClearFilters = vi.fn();

vi.mock('../../hooks/use-opportunities', () => ({
  useOpportunities: () => ({
    opportunities: {
      data: [],
      loading: false,
      error: null,
    },
    loadOpportunities: mockLoadOpportunities,
    createOpportunity: mockCreateOpportunity,
    updateOpportunity: mockUpdateOpportunity,
    deleteOpportunity: mockDeleteOpportunity,
  }),
}));

vi.mock('../../hooks/use-opportunity-filters', () => ({
  useOpportunityFilters: () => ({
    filters: { search: '', stage: 'all' },
    filteredOpportunities: [],
    updateSearch: mockUpdateSearch,
    updateStage: mockUpdateStage,
    clearFilters: mockClearFilters,
  }),
}));

// Mock components with simple implementations
vi.mock('../../components/table/opportunities-table', () => ({
  OpportunitiesTable: ({ onClearFilters }: any) => (
    <div data-testid="opportunities-table">
      <p>Opportunities Table</p>
      <button onClick={onClearFilters}>Clear Filters</button>
    </div>
  ),
}));

import { OpportunitiesPage } from '../opportunities-page';

describe('OpportunitiesPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render opportunities page with all main components', () => {
    render(<OpportunitiesPage />);

    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Track your sales opportunities')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByTestId('opportunities-table')).toBeInTheDocument();
  });

  it('should handle clear filters', () => {
    render(<OpportunitiesPage />);

    fireEvent.click(screen.getByText('Clear Filters'));

    expect(mockClearFilters).toHaveBeenCalled();
  });

  it('should integrate all hooks correctly', () => {
    render(<OpportunitiesPage />);

    // Verify the page renders without errors when hooks are integrated
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
  });

  it('should handle refresh button click', () => {
    render(<OpportunitiesPage />);

    fireEvent.click(screen.getByText('Refresh'));

    expect(mockLoadOpportunities).toHaveBeenCalled();
  });

  it('should render without errors when all hooks work together', () => {
    render(<OpportunitiesPage />);

    // Test that page renders and hooks integrate correctly
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });
});