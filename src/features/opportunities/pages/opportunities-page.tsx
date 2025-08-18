import { useCallback } from 'react';
import { useOpportunities } from '../hooks/use-opportunities';
import { useOpportunityFilters } from '../hooks/use-opportunity-filters';
import { OpportunitiesTable, OpportunityFilters } from '../components';
import { Button } from '@/components/ui/button';

export const OpportunitiesPage = () => {
  const { opportunities, loadOpportunities } = useOpportunities();
  const { filters, filteredOpportunities, updateSearch, updateStage, clearFilters } = useOpportunityFilters(opportunities.data || []);

  const handleRefresh = useCallback(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Opportunities
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Track your sales opportunities
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={opportunities.loading}
            size="sm"
          >
            Refresh
          </Button>
        </div>
        
        <OpportunityFilters
          query={filters.search}
          onQueryChange={updateSearch}
          stage={filters.stage}
          onStageChange={updateStage}
        />
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
        {/* Main content */}
        <OpportunitiesTable
          opportunities={filteredOpportunities}
          loading={opportunities.loading}
          error={opportunities.error}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
};
