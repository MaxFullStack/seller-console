import { useCallback, useEffect } from 'react';
import { useAsyncOperation } from '@/hooks/use-async-operation';
import { leadRepository } from '../api/lead-repository';
import { Lead, UpdateLeadInput } from '../model/lead';
import { CreateOpportunityInput } from '../../opportunities/model/opportunity';
import { opportunityRepository } from '../../opportunities/api/opportunity-repository';

export const useLeads = () => {
  const [leads, executeLeadsOperation] = useAsyncOperation<Lead[]>([]);

  const loadLeads = useCallback(async () => {
    await executeLeadsOperation(() => leadRepository.list());
  }, [executeLeadsOperation]);

  const updateLead = useCallback(async (input: UpdateLeadInput) => {
    await executeLeadsOperation(async () => {
      await leadRepository.update(input);
      return leadRepository.list();
    });
  }, [executeLeadsOperation]);

  const convertToOpportunity = useCallback(async (leadId: string, input: CreateOpportunityInput) => {
    await executeLeadsOperation(async () => {
      await opportunityRepository.create(input);
      await leadRepository.delete(leadId);
      return leadRepository.list();
    });
  }, [executeLeadsOperation]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return {
    leads,
    loadLeads,
    updateLead,
    convertToOpportunity,
  };
};