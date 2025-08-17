import {
  Opportunity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from '../model/opportunity';
import { delay, generateId } from '@/lib/utils';

const STORAGE_KEY = 'mini-seller-console-opportunities';

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
];

export class OpportunityRepository {
  private getOpportunities(): Opportunity[] {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockOpportunities;
  }

  private saveOpportunities(opportunities: Opportunity[]): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
  }

  async list(): Promise<Opportunity[]> {
    await delay(500);
    return this.getOpportunities();
  }

  async create(input: CreateOpportunityInput): Promise<Opportunity> {
    await delay(700);
    const opportunities = this.getOpportunities();
    const newOpportunity: Opportunity = {
      ...input,
      id: generateId(),
    };
    const updatedOpportunities = [...opportunities, newOpportunity];
    this.saveOpportunities(updatedOpportunities);
    return newOpportunity;
  }

  async update(input: UpdateOpportunityInput): Promise<Opportunity> {
    await delay(600);
    const opportunities = this.getOpportunities();
    const index = opportunities.findIndex((opp) => opp.id === input.id);

    if (index === -1) {
      throw new Error('Opportunity not found');
    }

    const updatedOpportunity = { ...opportunities[index], ...input };
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
