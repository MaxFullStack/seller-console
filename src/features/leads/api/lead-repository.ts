import { Lead, CreateLeadInput, UpdateLeadInput } from "../model/lead";
import { delay, generateId } from "@/lib/utils";

const STORAGE_KEY = "seller-console-leads";

// Mock data for initial load
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Anna Smith",
    company: "TechCorp",
    email: "anna.smith@techcorp.com",
    source: "web",
    score: 85,
    status: "new",
  },
  {
    id: "2",
    name: "Carlos Johnson",
    company: "DataFlow",
    email: "carlos@dataflow.com",
    source: "referral",
    score: 92,
    status: "qualified",
  },
  {
    id: "3",
    name: "Marina Williams",
    company: "CloudSys",
    email: "marina.williams@cloudsys.com",
    source: "social",
    score: 78,
    status: "contacted",
  },
  {
    id: "4",
    name: "John Peterson",
    company: "StartupAI",
    email: "john@startupai.com",
    source: "email",
    score: 96,
    status: "new",
  },
  {
    id: "5",
    name: "Lucy Brown",
    company: "FinTech Solutions",
    email: "lucy@fintech.com",
    source: "phone",
    score: 74,
    status: "unqualified",
  },
];

export class LeadRepository {
  private async loadInitialData(): Promise<Lead[]> {
    try {
      // Use relative path that works with base path configuration
      const basePath = import.meta.env.BASE_URL || '/';
      const dataUrl = `${basePath}data/leads.json`;
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error("Failed to load leads data");
      }
      return await response.json();
    } catch (error) {
      console.warn("Failed to load leads from JSON, using mock data:", error);
      return mockLeads;
    }
  }

  private getLeads(): Lead[] {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveLeads(leads: Lead[]): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }

  async list(): Promise<Lead[]> {
    await delay(600); // Simulate network latency

    // Check if we have data in localStorage
    const existingLeads = this.getLeads();
    if (existingLeads.length > 0) {
      return existingLeads;
    }

    // Load initial data from JSON file
    const initialLeads = await this.loadInitialData();
    this.saveLeads(initialLeads);
    return initialLeads;
  }

  async create(input: CreateLeadInput): Promise<Lead> {
    await delay(800);

    // Validate input using Zod schema
    const validatedInput = CreateLeadInput.parse(input);

    const leads = this.getLeads();
    const newLead: Lead = {
      ...validatedInput,
      id: generateId(),
    };
    const updatedLeads = [...leads, newLead];
    this.saveLeads(updatedLeads);
    return newLead;
  }

  async update(input: UpdateLeadInput): Promise<Lead> {
    await delay(700);

    // Validate input using Zod schema
    const validatedInput = UpdateLeadInput.parse(input);

    const leads = this.getLeads();
    const index = leads.findIndex((lead) => lead.id === validatedInput.id);

    if (index === -1) {
      throw new Error("Lead not found");
    }

    const updatedLead = { ...leads[index], ...validatedInput };
    const updatedLeads = [...leads];
    updatedLeads[index] = updatedLead;

    this.saveLeads(updatedLeads);
    return updatedLead;
  }

  async delete(id: string): Promise<void> {
    await delay(500);
    const leads = this.getLeads();
    const filteredLeads = leads.filter((lead) => lead.id !== id);

    if (filteredLeads.length === leads.length) {
      throw new Error("Lead not found");
    }

    this.saveLeads(filteredLeads);
  }

  async findById(id: string): Promise<Lead | null> {
    await delay(300);
    const leads = this.getLeads();
    return leads.find((lead) => lead.id === id) || null;
  }
}

export const leadRepository = new LeadRepository();
