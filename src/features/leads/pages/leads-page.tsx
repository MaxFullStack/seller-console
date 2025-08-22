import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useLeads } from '../hooks/use-leads';
import { useLeadSelection } from '../hooks/use-lead-selection';
import { useLeadFilters } from '../hooks/use-lead-filters';
import { useConvertDialog } from '../hooks/use-convert-dialog';
import { LeadsTable, LeadDetailPanel, LeadFilters } from '../components';
import { UpdateLeadInput, Lead } from '../model/lead';
import { ConvertLeadDialog } from '../../opportunities/components';
import { CreateOpportunityInput } from '../../opportunities/model/opportunity';
import { Button } from '@/components/ui/button';

export const LeadsPage = () => {
  const { leads, loadLeads, updateLead, convertToOpportunity } = useLeads();
  const { selectedLead, isPanelOpen, selectLead, closeLead } = useLeadSelection();
  const { filters, filteredLeads, updateSearch, updateStatus, clearFilters } = useLeadFilters(leads.data || []);
  const { isOpen: isConvertDialogOpen, openDialog: openConvertDialog, closeDialog: closeConvertDialog } = useConvertDialog();

  const handleLeadSelect = useCallback((lead: Lead) => {
    selectLead(lead);
  }, [selectLead]);

  const handleLeadUpdate = useCallback(async (input: UpdateLeadInput) => {
    await updateLead(input);
  }, [updateLead]);

  const handleConvertLead = useCallback(async (input: CreateOpportunityInput) => {
    if (!selectedLead) return;
    
    try {
      await convertToOpportunity(selectedLead.id, input);
      toast.success(`Lead "${selectedLead.name}" successfully converted to opportunity!`);
      closeConvertDialog();
      closeLead();
    } catch {
      toast.error('Error converting lead to opportunity. Please try again.');
    }
  }, [convertToOpportunity, selectedLead, closeConvertDialog, closeLead]);

  const handleRefresh = useCallback(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Leads
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your leads and convert them to opportunities
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={leads.loading}
            size="sm"
          >
            Refresh
          </Button>
        </div>
        
        <LeadFilters
          query={filters.search}
          onQueryChange={updateSearch}
          status={filters.status}
          onStatusChange={updateStatus}
        />
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
        <LeadsTable
          leads={filteredLeads}
          loading={leads.loading}
          error={leads.error}
          onLeadSelect={handleLeadSelect}
          onClearFilters={clearFilters}
        />
      </div>

      <LeadDetailPanel
        lead={selectedLead}
        isOpen={isPanelOpen}
        onClose={closeLead}
        onSave={handleLeadUpdate}
        onConvert={openConvertDialog}
        isLoading={leads.loading}
      />

      <ConvertLeadDialog
        lead={selectedLead}
        isOpen={isConvertDialogOpen}
        onClose={closeConvertDialog}
        onConvert={handleConvertLead}
        isLoading={leads.loading}
      />
    </div>
  );
};
