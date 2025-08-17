import { useCallback } from 'react';
import { useLeads } from '../hooks/use-leads';
import { useLeadSelection } from '../hooks/use-lead-selection';
import { useLeadFilters } from '../hooks/use-lead-filters';
import { useConvertDialog } from '../hooks/use-convert-dialog';
import { LeadsTable, LeadDetailPanel, LeadFilters } from '../components';
import { UpdateLeadInput, Lead } from '../model/lead';
import { ConvertLeadDialog } from '../../opportunities/components';
import { CreateOpportunityInput } from '../../opportunities/model/opportunity';

export const LeadsPage = () => {
  const { leads, updateLead, convertToOpportunity } = useLeads();
  const { selectedLead, isPanelOpen, selectLead, closeLead } = useLeadSelection();
  const { filters, filteredLeads, updateSearch, updateStatus } = useLeadFilters(leads.data || []);
  const { isOpen: isConvertDialogOpen, openDialog: openConvertDialog, closeDialog: closeConvertDialog } = useConvertDialog();

  const handleLeadSelect = useCallback((lead: Lead) => {
    selectLead(lead);
  }, [selectLead]);

  const handleLeadUpdate = useCallback(async (input: UpdateLeadInput) => {
    await updateLead(input);
  }, [updateLead]);

  const handleConvertLead = useCallback(async (input: CreateOpportunityInput) => {
    if (!selectedLead) return;
    await convertToOpportunity(selectedLead.id, input);
    closeConvertDialog();
    closeLead();
  }, [convertToOpportunity, selectedLead, closeConvertDialog, closeLead]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="sticky top-0 z-20 bg-background pb-4 sm:pb-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your leads and convert them to opportunities
          </p>
        </div>
        <LeadFilters
          query={filters.search}
          onQueryChange={updateSearch}
          status={filters.status}
          onStatusChange={updateStatus}
        />
      </div>

      <LeadsTable
        leads={filteredLeads}
        loading={leads.loading}
        error={leads.error}
        onLeadSelect={handleLeadSelect}
      />

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
