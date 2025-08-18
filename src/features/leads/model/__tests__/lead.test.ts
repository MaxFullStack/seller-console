import { describe, it, expect } from 'vitest';
import {
  Lead,
  LeadStatus,
  LeadSource,
  CreateLeadInput,
  UpdateLeadInput,
} from '../lead';

describe('Lead Model Validation', () => {
  const validLeadData = {
    id: '1',
    name: 'John Doe',
    company: 'TechCorp',
    email: 'john.doe@techcorp.com',
    source: 'web' as const,
    score: 85,
    status: 'new' as const,
  };

  describe('LeadStatus enum', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['new', 'contacted', 'qualified', 'unqualified'];
      
      validStatuses.forEach(status => {
        expect(() => LeadStatus.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid status values', () => {
      const invalidStatuses = ['invalid', 'pending', 'closed', ''];
      
      invalidStatuses.forEach(status => {
        expect(() => LeadStatus.parse(status)).toThrow();
      });
    });
  });

  describe('LeadSource enum', () => {
    it('should accept valid source values', () => {
      const validSources = ['web', 'referral', 'social', 'email', 'phone', 'other'];
      
      validSources.forEach(source => {
        expect(() => LeadSource.parse(source)).not.toThrow();
      });
    });

    it('should reject invalid source values', () => {
      const invalidSources = ['invalid', 'tv', 'radio', ''];
      
      invalidSources.forEach(source => {
        expect(() => LeadSource.parse(source)).toThrow();
      });
    });
  });

  describe('Lead schema', () => {
    it('should validate a complete valid lead', () => {
      expect(() => Lead.parse(validLeadData)).not.toThrow();
      
      const result = Lead.parse(validLeadData);
      expect(result).toEqual(validLeadData);
    });

    it('should require id field', () => {
      const invalidData = { ...validLeadData };
      delete (invalidData as any).id;
      
      expect(() => Lead.parse(invalidData)).toThrow();
    });

    it('should require name field', () => {
      const invalidData = { ...validLeadData, name: '' };
      
      expect(() => Lead.parse(invalidData)).toThrow(/Name is required/);
    });

    it('should require company field', () => {
      const invalidData = { ...validLeadData, company: '' };
      
      expect(() => Lead.parse(invalidData)).toThrow(/Company is required/);
    });

    it('should validate email format', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test.domain.com',
        '',
      ];

      invalidEmails.forEach(email => {
        const invalidData = { ...validLeadData, email };
        expect(() => Lead.parse(invalidData)).toThrow(/Invalid email/);
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@company.co.uk',
        'firstname+lastname@domain.org',
      ];

      validEmails.forEach(email => {
        const validData = { ...validLeadData, email };
        expect(() => Lead.parse(validData)).not.toThrow();
        const result = Lead.parse(validData);
        expect(result.email).toBe(email);
      });
    });

    it('should validate score range (0-100)', () => {
      const invalidScores = [-1, -10, 101, 150, 999];

      invalidScores.forEach(score => {
        const invalidData = { ...validLeadData, score };
        expect(() => Lead.parse(invalidData)).toThrow();
      });
    });

    it('should accept valid score range', () => {
      const validScores = [0, 1, 50, 99, 100];

      validScores.forEach(score => {
        const validData = { ...validLeadData, score };
        expect(() => Lead.parse(validData)).not.toThrow();
      });
    });

    it('should require valid source enum value', () => {
      const invalidData = { ...validLeadData, source: 'invalid' };
      
      expect(() => Lead.parse(invalidData)).toThrow();
    });

    it('should require valid status enum value', () => {
      const invalidData = { ...validLeadData, status: 'invalid' };
      
      expect(() => Lead.parse(invalidData)).toThrow();
    });

    it('should reject missing required fields', () => {
      const requiredFields = ['id', 'name', 'company', 'email', 'source', 'score', 'status'];
      
      requiredFields.forEach(field => {
        const invalidData = { ...validLeadData };
        delete (invalidData as any)[field];
        
        expect(() => Lead.parse(invalidData)).toThrow();
      });
    });

    it('should reject extra fields', () => {
      const dataWithExtras = {
        ...validLeadData,
        extraField: 'should not be allowed',
        anotherExtra: 123,
      };

      // Zod by default strips unknown keys, but we can make it strict
      expect(() => Lead.strict().parse(dataWithExtras)).toThrow();
    });
  });

  describe('CreateLeadInput schema', () => {
    it('should validate valid create input (without id)', () => {
      const createData = {
        name: 'Jane Smith',
        company: 'DataCorp',
        email: 'jane@datacorp.com',
        source: 'email' as const,
        score: 75,
        status: 'qualified' as const,
      };

      expect(() => CreateLeadInput.parse(createData)).not.toThrow();
      
      const result = CreateLeadInput.parse(createData);
      expect(result).toEqual(createData);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject create input with id field', () => {
      const invalidCreateData = {
        id: '123', // Should not be present in create input
        name: 'Jane Smith',
        company: 'DataCorp',
        email: 'jane@datacorp.com',
        source: 'email' as const,
        score: 75,
        status: 'qualified' as const,
      };

      expect(() => CreateLeadInput.strict().parse(invalidCreateData)).toThrow();
    });

    it('should inherit all Lead validations except id', () => {
      // Test that all the same validations apply
      const invalidCreateData = {
        name: '', // Invalid
        company: 'DataCorp',
        email: 'invalid-email', // Invalid
        source: 'email' as const,
        score: 150, // Invalid
        status: 'qualified' as const,
      };

      expect(() => CreateLeadInput.parse(invalidCreateData)).toThrow();
    });
  });

  describe('UpdateLeadInput schema', () => {
    it('should validate valid update input (with id required)', () => {
      const updateData = {
        id: '123',
        status: 'contacted' as const,
        score: 90,
      };

      expect(() => UpdateLeadInput.parse(updateData)).not.toThrow();
      
      const result = UpdateLeadInput.parse(updateData);
      expect(result).toEqual(updateData);
    });

    it('should require id field', () => {
      const updateDataWithoutId = {
        status: 'contacted' as const,
        score: 90,
      };

      expect(() => UpdateLeadInput.parse(updateDataWithoutId)).toThrow();
    });

    it('should allow partial updates', () => {
      const partialUpdates = [
        { id: '123', name: 'New Name' },
        { id: '123', email: 'new@email.com' },
        { id: '123', score: 95 },
        { id: '123', status: 'qualified' as const },
        { id: '123' }, // Only id is valid too
      ];

      partialUpdates.forEach(updateData => {
        expect(() => UpdateLeadInput.parse(updateData)).not.toThrow();
      });
    });

    it('should validate partial fields according to Lead schema', () => {
      const invalidPartialUpdates = [
        { id: '123', name: '' }, // Empty name
        { id: '123', email: 'invalid-email' }, // Invalid email
        { id: '123', score: 150 }, // Invalid score
        { id: '123', status: 'invalid' }, // Invalid status
      ];

      invalidPartialUpdates.forEach(updateData => {
        expect(() => UpdateLeadInput.parse(updateData)).toThrow();
      });
    });

    it('should allow updating all fields except keeping id required', () => {
      const fullUpdateData = {
        id: '123',
        name: 'Updated Name',
        company: 'Updated Company',
        email: 'updated@email.com',
        source: 'referral' as const,
        score: 95,
        status: 'qualified' as const,
      };

      expect(() => UpdateLeadInput.parse(fullUpdateData)).not.toThrow();
    });
  });

  describe('Type inference', () => {
    it('should correctly infer types', () => {
      // This test ensures TypeScript types are working correctly
      const lead: Lead = {
        id: '1',
        name: 'Test',
        company: 'Test Corp',
        email: 'test@test.com',
        source: 'web',
        score: 80,
        status: 'new',
      };

      const createInput: CreateLeadInput = {
        name: 'Test',
        company: 'Test Corp',
        email: 'test@test.com',
        source: 'web',
        score: 80,
        status: 'new',
      };

      const updateInput: UpdateLeadInput = {
        id: '1',
        status: 'qualified',
      };

      // If this compiles, the types are correctly inferred
      expect(lead.id).toBeDefined();
      expect(createInput.name).toBeDefined();
      expect(updateInput.id).toBeDefined();
      expect((createInput as any).id).toBeUndefined();
    });
  });
});