import { useState, useCallback, useEffect, useMemo } from 'react';
import { Opportunity, type OpportunityStage } from '../model/opportunity';

export type StageOption = 'all' | OpportunityStage;
export type OpportunityFilters = { search: string; stage: StageOption };

const STORAGE_KEY = 'opportunities-filters';

const defaultFilters: OpportunityFilters = {
  search: '',
  stage: 'all'
};

export const useOpportunityFilters = (opportunities: Opportunity[]) => {
  const [filters, setFilters] = useState<OpportunityFilters>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const updateStage = useCallback((stage: OpportunityFilters['stage']) => {
    setFilters(prev => ({ ...prev, stage }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesSearch = 
        !filters.search ||
        opportunity.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        opportunity.accountName.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStage = 
        filters.stage === 'all' || opportunity.stage === filters.stage;

      return matchesSearch && matchesStage;
    });
  }, [opportunities, filters]);

  return {
    filters,
    filteredOpportunities,
    updateSearch,
    updateStage,
    clearFilters,
  };
};