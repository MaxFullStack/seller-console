import {
  Opportunity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from '../model/opportunity';
import { delay, generateId } from '@/lib/utils';

const STORAGE_KEY = 'seller-console-opportunities';
const DATA_VERSION_KEY = 'seller-console-opportunities-version';
const CURRENT_DATA_VERSION = '2'; // Incrementar quando dados mudarem

// Mock data for initial load
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'TechCorp - CRM System',
    stage: 'proposal',
    amount: 45000,
    accountName: 'TechCorp',
    leadId: '1',
  },
  {
    id: '2',
    name: 'DataFlow - Analytics Platform',
    stage: 'negotiation',
    amount: 75000,
    accountName: 'DataFlow',
    leadId: '2',
  },
  {
    id: '3',
    name: 'GlobalTech - Enterprise Suite',
    stage: 'closed-won',
    amount: 125000,
    accountName: 'GlobalTech',
    leadId: '3',
  },
  {
    id: '4',
    name: 'StartupX - MVP Platform',
    stage: 'closed-won',
    amount: 35000,
    accountName: 'StartupX',
    leadId: '4',
  },
  {
    id: '5',
    name: 'FinanceInc - Compliance Tool',
    stage: 'closed-lost',
    amount: 60000,
    accountName: 'FinanceInc',
    leadId: '5',
  },
  {
    id: '6',
    name: 'RetailChain - Inventory System',
    stage: 'prospecting',
    amount: 80000,
    accountName: 'RetailChain',
    leadId: '6',
  },
  {
    id: '7',
    name: 'HealthCorp - Patient Portal',
    stage: 'qualification',
    amount: 95000,
    accountName: 'HealthCorp',
    leadId: '7',
  },
  {
    id: '8',
    name: 'EduTech - Learning Platform',
    stage: 'closed-won',
    amount: 42000,
    accountName: 'EduTech',
    leadId: '8',
  },
];

export class OpportunityRepository {
  private getOpportunities(): Opportunity[] {
    const storedVersion = window.localStorage.getItem(DATA_VERSION_KEY);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    
    // Se a versão mudou ou não existe, usar dados novos
    if (storedVersion !== CURRENT_DATA_VERSION || !stored) {
      this.saveOpportunities(mockOpportunities);
      window.localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      return mockOpportunities;
    }
    
    return JSON.parse(stored);
  }

  private saveOpportunities(opportunities: Opportunity[]): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
  }

  async list(): Promise<Opportunity[]> {
    await delay(150);
    return this.getOpportunities();
  }

  async create(input: CreateOpportunityInput): Promise<Opportunity> {
    await delay(700);
    
    // Validate input using Zod schema
    const validatedInput = CreateOpportunityInput.parse(input);
    
    const opportunities = this.getOpportunities();
    const newOpportunity: Opportunity = {
      ...validatedInput,
      id: generateId(),
    };
    const updatedOpportunities = [...opportunities, newOpportunity];
    this.saveOpportunities(updatedOpportunities);
    return newOpportunity;
  }

  async update(input: UpdateOpportunityInput): Promise<Opportunity> {
    await delay(600);
    
    // Validate input using Zod schema
    const validatedInput = UpdateOpportunityInput.parse(input);
    
    const opportunities = this.getOpportunities();
    const index = opportunities.findIndex((opp) => opp.id === validatedInput.id);

    if (index === -1) {
      throw new Error('Opportunity not found');
    }

    const updatedOpportunity = { ...opportunities[index], ...validatedInput };
    const updatedOpportunities = [...opportunities];
    updatedOpportunities[index] = updatedOpportunity;

    this.saveOpportunities(updatedOpportunities);
    return updatedOpportunity;
  }

  async delete(id: string): Promise<void> {
    await delay(400);
    const opportunities = this.getOpportunities();
    const filteredOpportunities = opportunities.filter((opp) => opp.id !== id);

    if (filteredOpportunities.length === opportunities.length) {
      throw new Error('Opportunity not found');
    }

    this.saveOpportunities(filteredOpportunities);
  }

  async findById(id: string): Promise<Opportunity | null> {
    await delay(250);
    const opportunities = this.getOpportunities();
    return opportunities.find((opp) => opp.id === id) || null;
  }
}

export const opportunityRepository = new OpportunityRepository();
