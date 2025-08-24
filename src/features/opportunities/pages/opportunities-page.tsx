import { useCallback, useState } from "react";
import { useOpportunities } from "../hooks/use-opportunities";
import { useOpportunityFilters } from "../hooks/use-opportunity-filters";
import { OpportunitiesTable, OpportunityFilters } from "../components";
import { EditOpportunityDialog } from "../components/dialog/edit-opportunity-dialog";
import { Button } from "@/components/ui/button";
import { Opportunity, UpdateOpportunityInput } from "../model/opportunity";

export const OpportunitiesPage = () => {
  const { opportunities, loadOpportunities, updateOpportunity } =
    useOpportunities();
  const {
    filters,
    filteredOpportunities,
    updateSearch,
    updateStage,
    clearFilters,
  } = useOpportunityFilters(opportunities.data || []);

  // Edit modal state
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const handleEditOpportunity = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedOpportunity(null);
  }, []);

  const handleUpdateOpportunity = useCallback(
    async (input: UpdateOpportunityInput) => {
      await updateOpportunity(input);
    },
    [updateOpportunity],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Opportunities
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
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
          onEdit={handleEditOpportunity}
        />
      </div>

      <EditOpportunityDialog
        opportunity={selectedOpportunity}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onUpdate={handleUpdateOpportunity}
        isLoading={opportunities.loading}
      />
    </div>
  );
};
