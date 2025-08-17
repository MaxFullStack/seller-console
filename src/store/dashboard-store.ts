import { create } from 'zustand';
import { Lead } from '@/features/leads/model/lead';
import { Opportunity } from '@/features/opportunities/model/opportunity';

interface DashboardState {
  leads: Lead[];
  opportunities: Opportunity[];
  lastUpdated: Date | null;
  
  // Actions
  setLeads: (leads: Lead[]) => void;
  setOpportunities: (opportunities: Opportunity[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  leads: [],
  opportunities: [],
  lastUpdated: null,
  
  setLeads: (leads) => set({ leads, lastUpdated: new Date() }),
  setOpportunities: (opportunities) => set({ opportunities, lastUpdated: new Date() }),
}));

// Computed metrics using separate hooks to avoid store complexity
export const useLeadsMetrics = () => {
  const leads = useDashboardStore(state => state.leads);
  
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const unqualifiedLeads = leads.filter(lead => lead.status === 'unqualified').length;
  const contactedLeads = leads.filter(lead => lead.status === 'contacted').length;
  const averageLeadScore = totalLeads > 0 
    ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads)
    : 0;
  const conversionRate = totalLeads > 0 
    ? Math.round((qualifiedLeads / totalLeads) * 100)
    : 0;

  return {
    totalLeads,
    newLeads,
    qualifiedLeads,
    unqualifiedLeads,
    contactedLeads,
    averageLeadScore,
    conversionRate,
  };
};

export const useOpportunitiesMetrics = () => {
  const opportunities = useDashboardStore(state => state.opportunities);
  
  const totalOpportunities = opportunities.length;
  const totalRevenue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const averageDealSize = totalOpportunities > 0 
    ? Math.round(totalRevenue / totalOpportunities)
    : 0;
  
  const opportunitiesByStage = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const qualifiedLeads = useDashboardStore(state => state.leads.filter(lead => lead.status === 'qualified').length);
  const opportunityConversionRate = qualifiedLeads > 0
    ? Math.round((totalOpportunities / qualifiedLeads) * 100)
    : 0;

  return {
    totalOpportunities,
    totalRevenue,
    averageDealSize,
    opportunitiesByStage,
    opportunityConversionRate,
  };
};

export const useOverallMetrics = () => {
  const leadsMetrics = useLeadsMetrics();
  const opportunitiesMetrics = useOpportunitiesMetrics();
  const lastUpdated = useDashboardStore(state => state.lastUpdated);
  
  return {
    metrics: {
      ...leadsMetrics,
      ...opportunitiesMetrics,
    },
    lastUpdated,
  };
};