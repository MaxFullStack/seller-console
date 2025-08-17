import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Lead } from '@/features/leads/model/lead';
import { Opportunity } from '@/features/opportunities/model/opportunity';

interface DashboardMetrics {
  // Lead metrics
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  unqualifiedLeads: number;
  contactedLeads: number;
  averageLeadScore: number;
  
  // Opportunity metrics  
  totalOpportunities: number;
  totalRevenue: number;
  averageDealSize: number;
  opportunitiesByStage: Record<string, number>;
  
  // Overall metrics
  conversionRate: number; // qualified leads / total leads
  opportunityConversionRate: number; // opportunities / qualified leads
}

interface DashboardState {
  leads: Lead[];
  opportunities: Opportunity[];
  metrics: DashboardMetrics;
  lastUpdated: Date | null;
  
  // Actions
  setLeads: (leads: Lead[]) => void;
  setOpportunities: (opportunities: Opportunity[]) => void;
  updateMetrics: () => void;
}

const calculateMetrics = (leads: Lead[], opportunities: Opportunity[]): DashboardMetrics => {
  // Lead calculations
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const unqualifiedLeads = leads.filter(lead => lead.status === 'unqualified').length;
  const contactedLeads = leads.filter(lead => lead.status === 'contacted').length;
  const averageLeadScore = totalLeads > 0 
    ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / totalLeads)
    : 0;
  
  // Opportunity calculations
  const totalOpportunities = opportunities.length;
  const totalRevenue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const averageDealSize = totalOpportunities > 0 
    ? Math.round(totalRevenue / totalOpportunities)
    : 0;
  
  const opportunitiesByStage = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Conversion rates
  const conversionRate = totalLeads > 0 
    ? Math.round((qualifiedLeads / totalLeads) * 100)
    : 0;
  const opportunityConversionRate = qualifiedLeads > 0
    ? Math.round((totalOpportunities / qualifiedLeads) * 100)
    : 0;
  
  return {
    totalLeads,
    newLeads,
    qualifiedLeads,
    unqualifiedLeads,
    contactedLeads,
    averageLeadScore,
    totalOpportunities,
    totalRevenue,
    averageDealSize,
    opportunitiesByStage,
    conversionRate,
    opportunityConversionRate,
  };
};

export const useDashboardStore = create<DashboardState>()(
  subscribeWithSelector((set, get) => ({
    leads: [],
    opportunities: [],
    metrics: {
      totalLeads: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      unqualifiedLeads: 0,
      contactedLeads: 0,
      averageLeadScore: 0,
      totalOpportunities: 0,
      totalRevenue: 0,
      averageDealSize: 0,
      opportunitiesByStage: {},
      conversionRate: 0,
      opportunityConversionRate: 0,
    },
    lastUpdated: null,
    
    setLeads: (leads) => {
      set({ leads, lastUpdated: new Date() });
      get().updateMetrics();
    },
    
    setOpportunities: (opportunities) => {
      set({ opportunities, lastUpdated: new Date() });
      get().updateMetrics();
    },
    
    updateMetrics: () => {
      const { leads, opportunities } = get();
      const metrics = calculateMetrics(leads, opportunities);
      set({ metrics });
    },
  }))
);

// Selectors for easy access to specific metrics
export const useLeadsMetrics = () => useDashboardStore((state) => ({
  totalLeads: state.metrics.totalLeads,
  newLeads: state.metrics.newLeads,
  qualifiedLeads: state.metrics.qualifiedLeads,
  unqualifiedLeads: state.metrics.unqualifiedLeads,
  contactedLeads: state.metrics.contactedLeads,
  averageLeadScore: state.metrics.averageLeadScore,
  conversionRate: state.metrics.conversionRate,
}));

export const useOpportunitiesMetrics = () => useDashboardStore((state) => ({
  totalOpportunities: state.metrics.totalOpportunities,
  totalRevenue: state.metrics.totalRevenue,
  averageDealSize: state.metrics.averageDealSize,
  opportunitiesByStage: state.metrics.opportunitiesByStage,
  opportunityConversionRate: state.metrics.opportunityConversionRate,
}));

export const useOverallMetrics = () => useDashboardStore((state) => ({
  conversionRate: state.metrics.conversionRate,
  opportunityConversionRate: state.metrics.opportunityConversionRate,
  totalLeads: state.metrics.totalLeads,
  totalOpportunities: state.metrics.totalOpportunities,
  totalRevenue: state.metrics.totalRevenue,
  lastUpdated: state.lastUpdated,
}));