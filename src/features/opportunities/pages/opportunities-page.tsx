import { useCallback } from 'react';
import { useOpportunities } from '../hooks/use-opportunities';
import { useOpportunityFilters } from '../hooks/use-opportunity-filters';
import { OpportunitiesTable } from '../components';
import { Button } from '@/components/ui/button';

export const OpportunitiesPage = () => {
  const { opportunities, loadOpportunities } = useOpportunities();
  const { filteredOpportunities, clearFilters } = useOpportunityFilters(opportunities.data || []);

  const handleRefresh = useCallback(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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

      {/* Main content */}
      <OpportunitiesTable
        opportunities={filteredOpportunities}
        loading={opportunities.loading}
        error={opportunities.error}
        onClearFilters={clearFilters}
      />
    </div>
  );
};
