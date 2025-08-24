import { useCallback, useEffect } from "react";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { opportunityRepository } from "../api/opportunity-repository";
import {
  Opportunity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from "../model/opportunity";

export const useOpportunities = () => {
  const [opportunities, executeOpportunitiesOperation] = useAsyncOperation<
    Opportunity[]
  >([]);

  const loadOpportunities = useCallback(async () => {
    await executeOpportunitiesOperation(() => opportunityRepository.list());
  }, [executeOpportunitiesOperation]);

  const createOpportunity = useCallback(
    async (input: CreateOpportunityInput) => {
      await executeOpportunitiesOperation(async () => {
        await opportunityRepository.create(input);
        return opportunityRepository.list();
      });
    },
    [executeOpportunitiesOperation],
  );

  const updateOpportunity = useCallback(
    async (input: UpdateOpportunityInput) => {
      await executeOpportunitiesOperation(async () => {
        await opportunityRepository.update(input);
        return opportunityRepository.list();
      });
    },
    [executeOpportunitiesOperation],
  );

  const deleteOpportunity = useCallback(
    async (id: string) => {
      await executeOpportunitiesOperation(async () => {
        await opportunityRepository.delete(id);
        return opportunityRepository.list();
      });
    },
    [executeOpportunitiesOperation],
  );

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return {
    opportunities,
    loadOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };
};
