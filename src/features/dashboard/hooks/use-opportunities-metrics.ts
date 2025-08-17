import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboard-store';

/**
 * Hook for Opportunity-specific Metrics
 * 
 * Responsibilities:
 * - Calculate revenue from closed-won opportunities
 * - Calculate average deal size
 * - Calculate opportunities distribution by stage
 * - Calculate opportunity conversion rate (qualified leads → closed-won)
 * 
 * @returns Opportunity metrics derived from raw store data
 */
export const useOpportunitiesMetrics = () => {
  const opportunities = useDashboardStore(state => state.opportunities);
  const leads = useDashboardStore(state => state.leads);
  
  return useMemo(() => {
    const totalOpportunities = opportunities.length;
    
    // Revenue calculation - only from closed-won opportunities
    const closedWonOpportunities = opportunities.filter(opp => opp.stage === 'closed-won');
    const totalRevenue = closedWonOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    
    // Pipeline value - all opportunities with amounts
    const totalPipelineValue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    
    const averageDealSize = closedWonOpportunities.length > 0 
      ? Math.round(totalRevenue / closedWonOpportunities.length)
      : totalOpportunities > 0 ? Math.round(totalPipelineValue / totalOpportunities) : 0;
    
    // Stage distribution
    const opportunitiesByStage = opportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Win rate calculation
    const closedOpportunities = opportunities.filter(opp => 
      opp.stage === 'closed-won' || opp.stage === 'closed-lost'
    );
    const winRate = closedOpportunities.length > 0
      ? Math.round((closedWonOpportunities.length / closedOpportunities.length) * 100)
      : 0;
    
    // Conversion rate: qualified leads → closed-won deals
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
    const opportunityConversionRate = qualifiedLeads > 0
      ? Math.round((closedWonOpportunities.length / qualifiedLeads) * 100)
      : 0;

    return {
      totalOpportunities,
      totalRevenue,
      averageDealSize,
      totalPipelineValue,
      opportunitiesByStage,
      opportunityConversionRate,
      closedWonCount: closedWonOpportunities.length,
      winRate,
      activeOpportunities: opportunities.filter(opp => 
        !['closed-won', 'closed-lost'].includes(opp.stage)
      ).length,
    };
  }, [opportunities, leads]);
};