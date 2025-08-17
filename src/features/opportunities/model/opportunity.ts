import { z } from 'zod';

export const OpportunityStage = z.enum([
  'prospecting',
  'qualification',
  'needs-analysis',
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost',
]);
export type OpportunityStage = z.infer<typeof OpportunityStage>;

export const Opportunity = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  stage: OpportunityStage,
  amount: z.number().positive().optional(),
  accountName: z.string().min(1, 'Account name is required'),
  leadId: z.string().optional(), // Reference to original lead
});

export type Opportunity = z.infer<typeof Opportunity>;

export const CreateOpportunityInput = Opportunity.omit({ id: true });
export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInput>;

export const UpdateOpportunityInput = Opportunity.partial().required({
  id: true,
});
export type UpdateOpportunityInput = z.infer<typeof UpdateOpportunityInput>;
