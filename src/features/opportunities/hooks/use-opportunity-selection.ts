import { useState, useCallback } from 'react';
import { Opportunity } from '../model/opportunity';

export const useOpportunitySelection = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const selectOpportunity = useCallback((opportunity: Opportunity | null) => {
    setSelectedOpportunity(opportunity);
    setIsPanelOpen(opportunity !== null);
  }, []);

  const closeOpportunity = useCallback(() => {
    setSelectedOpportunity(null);
    setIsPanelOpen(false);
  }, []);

  return {
    selectedOpportunity,
    isPanelOpen,
    selectOpportunity,
    closeOpportunity,
  };
};