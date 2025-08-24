import { useState, useCallback, useEffect, useMemo } from "react";
import { Lead, type LeadFilters } from "../model/lead";

const STORAGE_KEY = "leads-filters";

const defaultFilters: LeadFilters = {
  search: "",
  status: "all",
};

export const useLeadFilters = (leads: Lead[]) => {
  const [filters, setFilters] = useState<LeadFilters>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const updateStatus = useCallback((status: LeadFilters["status"]) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !filters.search ||
        lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.company.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        filters.status === "all" || lead.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [leads, filters]);

  return {
    filters,
    filteredLeads,
    updateSearch,
    updateStatus,
    clearFilters,
  };
};
