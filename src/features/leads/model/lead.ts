import { z } from 'zod';

export const LeadStatus = z.enum([
  'new',
  'contacted',
  'qualified',
  'unqualified',
]);
export type LeadStatus = z.infer<typeof LeadStatus>;

export const LeadSource = z.enum([
  'web',
  'referral',
  'social',
  'email',
  'phone',
  'other',
]);
export type LeadSource = z.infer<typeof LeadSource>;

export const Lead = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email'),
  source: LeadSource,
  score: z.number().min(0).max(100),
  status: LeadStatus,
});

export type Lead = z.infer<typeof Lead>;

export const CreateLeadInput = Lead.omit({ id: true });
export type CreateLeadInput = z.infer<typeof CreateLeadInput>;

export const UpdateLeadInput = Lead.partial().required({ id: true });
export type UpdateLeadInput = z.infer<typeof UpdateLeadInput>;

export type StatusOption = 'all' | LeadStatus;
export type LeadFilters = { search: string; status: StatusOption };