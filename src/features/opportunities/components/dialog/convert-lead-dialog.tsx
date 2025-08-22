import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Lead } from '../../../leads/model/lead';
import { CreateOpportunityInput } from '../../model/opportunity';

export interface ConvertLeadDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (input: CreateOpportunityInput) => Promise<void>;
  isLoading: boolean;
}

// Initial stages only - Won/Lost should be handled in opportunity edit modal
const stageOptions = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'needs-analysis', label: 'Needs Analysis' },
  { value: 'proposal', label: 'Proposal' },
] as const;

const convertLeadSchema = z.object({
  name: z.string()
    .min(1, 'Opportunity name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be no more than 100 characters')
    .trim(),
  accountName: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be no more than 100 characters')
    .trim(),
  stage: z.enum(['prospecting', 'qualification', 'needs-analysis', 'proposal', 'negotiation']),
  amount: z.union([
    z.string().length(0),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number')
      .refine(val => {
        const num = parseFloat(val);
        return num >= 0 && num <= 999999999;
      }, 'Amount must be between 0 and 999,999,999')
  ]),
});

type ConvertLeadFormData = z.infer<typeof convertLeadSchema>;

export const ConvertLeadDialog = ({
  lead,
  isOpen,
  onClose,
  onConvert,
  isLoading,
}: ConvertLeadDialogProps) => {
  const form = useForm<ConvertLeadFormData>({
    resolver: zodResolver(convertLeadSchema),
    defaultValues: {
      name: '',
      stage: 'prospecting',
      amount: '',
      accountName: '',
    },
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        name: `${lead.company} - Opportunity`,
        stage: 'prospecting',
        amount: '',
        accountName: lead.company,
      });
    }
  }, [lead, form]);

  const handleSubmit = async (values: ConvertLeadFormData) => {
    if (!lead) return;
    try {
      await onConvert({
        name: values.name.trim(),
        stage: values.stage,
        amount: values.amount ? Number(values.amount) : undefined,
        accountName: values.accountName.trim(),
        leadId: lead.id,
      });
      onClose();
    } catch (error) {
      console.error('Convert failed:', error);
    }
  };

  if (!lead) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md p-0">
        <SheetHeader className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 pr-16 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SheetTitle>Convert Lead to Opportunity</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex h-full flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-28 space-y-6">
            <div className="rounded-xl border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Selected Lead</h3>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{lead.name}</dd>

                <dt className="text-muted-foreground">Company</dt>
                <dd className="font-medium">{lead.company}</dd>

                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{lead.email}</dd>

                <dt className="text-muted-foreground">Score</dt>
                <dd className="font-medium">{lead.score}</dd>
              </dl>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Opportunity Data</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Opportunity name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Account/company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (optional)</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">Estimated opportunity value</p>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* FOOTER STICKY (botões sempre visíveis) */}
          <div className="sticky bottom-0 z-10 border-t bg-background px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Converting…' : 'Convert to Opportunity'}
              </Button>
            </div>
          </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
