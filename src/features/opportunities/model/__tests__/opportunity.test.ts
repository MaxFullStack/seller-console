import { describe, it, expect } from 'vitest';
import {
  Opportunity,
  OpportunityStage,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from '../opportunity';

describe('Opportunity Model Validation', () => {
  const validOpportunityData = {
    id: '1',
    name: 'TechCorp - CRM System',
    stage: 'proposal' as const,
    amount: 50000,
    accountName: 'TechCorp',
    leadId: 'lead-123',
  };

  describe('OpportunityStage enum', () => {
    it('should accept valid stage values', () => {
      const validStages = [
        'prospecting',
        'qualification',
        'needs-analysis',
        'proposal',
        'negotiation',
        'closed-won',
        'closed-lost',
      ];
      
      validStages.forEach(stage => {
        expect(() => OpportunityStage.parse(stage)).not.toThrow();
      });
    });

    it('should reject invalid stage values', () => {
      const invalidStages = ['invalid', 'pending', 'open', 'completed', ''];
      
      invalidStages.forEach(stage => {
        expect(() => OpportunityStage.parse(stage)).toThrow();
      });
    });
  });

  describe('Opportunity schema', () => {
    it('should validate a complete valid opportunity', () => {
      expect(() => Opportunity.parse(validOpportunityData)).not.toThrow();
      
      const result = Opportunity.parse(validOpportunityData);
      expect(result).toEqual(validOpportunityData);
    });

    it('should require id field', () => {
      const invalidData = { ...validOpportunityData };
      delete (invalidData as any).id;
      
      expect(() => Opportunity.parse(invalidData)).toThrow();
    });

    it('should require name field', () => {
      const invalidData = { ...validOpportunityData, name: '' };
      
      expect(() => Opportunity.parse(invalidData)).toThrow(/Name is required/);
    });

    it('should require accountName field', () => {
      const invalidData = { ...validOpportunityData, accountName: '' };
      
      expect(() => Opportunity.parse(invalidData)).toThrow(/Account name is required/);
    });

    it('should require valid stage enum value', () => {
      const invalidData = { ...validOpportunityData, stage: 'invalid' };
      
      expect(() => Opportunity.parse(invalidData)).toThrow();
    });

    it('should validate amount is positive when provided', () => {
      const invalidAmounts = [0, -1, -1000, -0.01];

      invalidAmounts.forEach(amount => {
        const invalidData = { ...validOpportunityData, amount };
        expect(() => Opportunity.parse(invalidData)).toThrow();
      });
    });

    it('should accept valid positive amounts', () => {
      const validAmounts = [0.01, 1, 100, 50000, 999999.99];

      validAmounts.forEach(amount => {
        const validData = { ...validOpportunityData, amount };
        expect(() => Opportunity.parse(validData)).not.toThrow();
      });
    });

    it('should allow amount to be optional', () => {
      const dataWithoutAmount = {
        id: '1',
        name: 'TechCorp - CRM System',
        stage: 'proposal' as const,
        accountName: 'TechCorp',
        leadId: 'lead-123',
        // amount is omitted
      };

      expect(() => Opportunity.parse(dataWithoutAmount)).not.toThrow();
      
      const result = Opportunity.parse(dataWithoutAmount);
      expect(result.amount).toBeUndefined();
    });

    it('should allow leadId to be optional', () => {
      const dataWithoutLeadId = {
        id: '1',
        name: 'Direct Opportunity',
        stage: 'prospecting' as const,
        amount: 25000,
        accountName: 'DirectCorp',
        // leadId is omitted
      };

      expect(() => Opportunity.parse(dataWithoutLeadId)).not.toThrow();
      
      const result = Opportunity.parse(dataWithoutLeadId);
      expect(result.leadId).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const requiredFields = ['id', 'name', 'stage', 'accountName'];
      
      requiredFields.forEach(field => {
        const invalidData = { ...validOpportunityData };
        delete (invalidData as any)[field];
        
        expect(() => Opportunity.parse(invalidData)).toThrow();
      });
    });

    it('should allow only optional fields to be missing', () => {
      const minimalValidData = {
        id: '1',
        name: 'Minimal Opportunity',
        stage: 'prospecting' as const,
        accountName: 'MinimalCorp',
        // amount and leadId are optional
      };

      expect(() => Opportunity.parse(minimalValidData)).not.toThrow();
    });

    it('should reject extra fields in strict mode', () => {
      const dataWithExtras = {
        ...validOpportunityData,
        extraField: 'should not be allowed',
        priority: 'high',
      };

      expect(() => Opportunity.strict().parse(dataWithExtras)).toThrow();
    });
  });

  describe('CreateOpportunityInput schema', () => {
    it('should validate valid create input (without id)', () => {
      const createData = {
        name: 'New Opportunity',
        stage: 'prospecting' as const,
        amount: 75000,
        accountName: 'NewCorp',
        leadId: 'lead-456',
      };

      expect(() => CreateOpportunityInput.parse(createData)).not.toThrow();
      
      const result = CreateOpportunityInput.parse(createData);
      expect(result).toEqual(createData);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject create input with id field', () => {
      const invalidCreateData = {
        id: '123', // Should not be present in create input
        name: 'New Opportunity',
        stage: 'prospecting' as const,
        amount: 75000,
        accountName: 'NewCorp',
        leadId: 'lead-456',
      };

      expect(() => CreateOpportunityInput.strict().parse(invalidCreateData)).toThrow();
    });

    it('should inherit all Opportunity validations except id', () => {
      const invalidCreateData = {
        name: '', // Invalid - empty name
        stage: 'invalid' as any, // Invalid stage
        amount: -1000, // Invalid - negative amount
        accountName: '', // Invalid - empty account name
        leadId: 'lead-456',
      };

      expect(() => CreateOpportunityInput.parse(invalidCreateData)).toThrow();
    });

    it('should allow minimal valid create input', () => {
      const minimalCreateData = {
        name: 'Minimal Opportunity',
        stage: 'prospecting' as const,
        accountName: 'MinimalCorp',
        // amount and leadId are optional
      };

      expect(() => CreateOpportunityInput.parse(minimalCreateData)).not.toThrow();
    });
  });

  describe('UpdateOpportunityInput schema', () => {
    it('should validate valid update input (with id required)', () => {
      const updateData = {
        id: '123',
        stage: 'negotiation' as const,
        amount: 60000,
      };

      expect(() => UpdateOpportunityInput.parse(updateData)).not.toThrow();
      
      const result = UpdateOpportunityInput.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should require id field', () => {
      const updateDataWithoutId = {
        stage: 'negotiation' as const,
        amount: 60000,
      };

      expect(() => UpdateOpportunityInput.parse(updateDataWithoutId)).toThrow();
    });

    it('should allow partial updates', () => {
      const partialUpdates = [
        { id: '123', name: 'Updated Name' },
        { id: '123', stage: 'closed-won' as const },
        { id: '123', amount: 80000 },
        { id: '123', accountName: 'Updated Account' },
        { id: '123', leadId: 'new-lead-id' },
        { id: '123' }, // Only id is valid too
      ];

      partialUpdates.forEach(updateData => {
        expect(() => UpdateOpportunityInput.parse(updateData)).not.toThrow();
      });
    });

    it('should validate partial fields according to Opportunity schema', () => {
      const invalidPartialUpdates = [
        { id: '123', name: '' }, // Empty name
        { id: '123', stage: 'invalid' }, // Invalid stage
        { id: '123', amount: -500 }, // Negative amount
        { id: '123', accountName: '' }, // Empty account name
      ];

      invalidPartialUpdates.forEach(updateData => {
        expect(() => UpdateOpportunityInput.parse(updateData)).toThrow();
      });
    });

    it('should allow updating all fields except keeping id required', () => {
      const fullUpdateData = {
        id: '123',
        name: 'Fully Updated Opportunity',
        stage: 'closed-won' as const,
        amount: 95000,
        accountName: 'Updated Account Name',
        leadId: 'updated-lead-id',
      };

      expect(() => UpdateOpportunityInput.parse(fullUpdateData)).not.toThrow();
    });

    it('should allow removing optional fields by setting to undefined', () => {
      const updateWithUndefined = {
        id: '123',
        amount: undefined, // Remove amount
        leadId: undefined, // Remove leadId
      };

      expect(() => UpdateOpportunityInput.parse(updateWithUndefined)).not.toThrow();
    });
  });

  describe('Business logic validations', () => {
    it('should handle all valid stage transitions', () => {
      const stages: Array<typeof validOpportunityData.stage> = [
        'prospecting',
        'qualification',
        'needs-analysis',
        'proposal',
        'negotiation',
        'closed-won',
        'closed-lost',
      ];

      stages.forEach(stage => {
        const data = { ...validOpportunityData, stage };
        expect(() => Opportunity.parse(data)).not.toThrow();
      });
    });

    it('should handle various amount formats', () => {
      const amounts = [
        1,
        100.50,
        1000000,
        0.01,
        999999.99,
      ];

      amounts.forEach(amount => {
        const data = { ...validOpportunityData, amount };
        expect(() => Opportunity.parse(data)).not.toThrow();
      });
    });
  });

  describe('Type inference', () => {
    it('should correctly infer types', () => {
      // This test ensures TypeScript types are working correctly
      const opportunity: Opportunity = {
        id: '1',
        name: 'Test Opportunity',
        stage: 'proposal',
        amount: 50000,
        accountName: 'Test Account',
        leadId: 'lead-1',
      };

      const createInput: CreateOpportunityInput = {
        name: 'Test Opportunity',
        stage: 'proposal',
        amount: 50000,
        accountName: 'Test Account',
        leadId: 'lead-1',
      };

      const updateInput: UpdateOpportunityInput = {
        id: '1',
        stage: 'negotiation',
      };

      // If this compiles, the types are correctly inferred
      expect(opportunity.id).toBeDefined();
      expect(createInput.name).toBeDefined();
      expect(updateInput.id).toBeDefined();
      expect((createInput as any).id).toBeUndefined();
      
      // Test optional fields
      expect(opportunity.amount).toBeDefined();
      expect(opportunity.leadId).toBeDefined();
    });

    it('should handle optional fields correctly in types', () => {
      const opportunityWithoutOptionals: Opportunity = {
        id: '1',
        name: 'Test',
        stage: 'prospecting',
        accountName: 'Test Account',
        // amount and leadId are optional
      };

      const createWithoutOptionals: CreateOpportunityInput = {
        name: 'Test',
        stage: 'prospecting',
        accountName: 'Test Account',
        // amount and leadId are optional
      };

      expect(opportunityWithoutOptionals.amount).toBeUndefined();
      expect(opportunityWithoutOptionals.leadId).toBeUndefined();
      expect(createWithoutOptionals.amount).toBeUndefined();
      expect(createWithoutOptionals.leadId).toBeUndefined();
    });
  });
});