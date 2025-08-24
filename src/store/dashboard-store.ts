import { create } from "zustand";
import { Lead } from "@/features/leads/model/lead";
import { Opportunity } from "@/features/opportunities/model/opportunity";

/**
 * Dashboard Store - Single Source of Truth for Raw Data
 *
 * Responsibilities:
 * - Store leads and opportunities data
 * - Provide simple setters
 * - Track last update timestamp
 *
 * NOT responsible for:
 * - Calculations or business logic
 * - Derived metrics
 * - UI logic
 */

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
  setOpportunities: (opportunities) =>
    set({ opportunities, lastUpdated: new Date() }),
}));
