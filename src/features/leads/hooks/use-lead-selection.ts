import { useState, useCallback } from 'react';
import { Lead } from '../model/lead';

export const useLeadSelection = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const selectLead = useCallback((lead: Lead | null) => {
    setSelectedLead(lead);
    setIsPanelOpen(lead !== null);
  }, []);

  const closeLead = useCallback(() => {
    setSelectedLead(null);
    setIsPanelOpen(false);
  }, []);

  return {
    selectedLead,
    isPanelOpen,
    selectLead,
    closeLead,
  };
};