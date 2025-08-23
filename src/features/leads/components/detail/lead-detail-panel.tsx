import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Lead, UpdateLeadInput } from '../../model/lead';

export interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: UpdateLeadInput) => Promise<void>;
  onConvert: () => void;
  isLoading: boolean;
}

const statusOptions = [
  { value: 'new',         label: 'New' },
  { value: 'contacted',   label: 'Contacted' },
  { value: 'qualified',   label: 'Qualified' },
  { value: 'unqualified', label: 'Unqualified' },
] as const;

const leadDetailSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified']),
});

type LeadDetailFormData = z.infer<typeof leadDetailSchema>;

export const LeadDetailPanel = ({
  lead,
  isOpen,
  onClose,
  onSave,
  onConvert,
  isLoading,
}: LeadDetailPanelProps) => {
  const form = useForm<LeadDetailFormData>({
    resolver: zodResolver(leadDetailSchema),
    defaultValues: {
      email: '',
      status: 'new',
    },
  });

  const { formState: { isDirty } } = form;

  useEffect(() => {
    if (lead) {
      form.reset({
        email: lead.email,
        status: lead.status,
      });
    }
  }, [lead, form]);

  const handleSave = async (values: LeadDetailFormData) => {
    if (!lead) return;
    try {
      await onSave({ id: lead.id, email: values.email.trim(), status: values.status });
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Do you really want to cancel?');
      if (!confirmed) return;
    }
    onClose();
  };

  if (!lead) return null;

  // Fields ready to scale: add/remove without touching the layout
  const basicInfo: { label: string; value: React.ReactNode }[] = [
    { label: 'Name',    value: lead.name },
    { label: 'Company', value: lead.company },
    { label: 'Source',  value: lead.source },
    { label: 'Score',   value: lead.score },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={handleCancel}>
      <SheetContent className="sm:max-w-md p-0">
        {/* Header sticky */}
        <SheetHeader className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 pr-16 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SheetTitle>Lead Details</SheetTitle>
        </SheetHeader>

        {/* Body scrollável + footer sticky */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="flex h-full flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-28 space-y-6">
            {/* ==== Basic Information (Card shadcn) ==== */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                <CardDescription>Lead snapshot</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  {basicInfo.map((item, index) => (
                    <React.Fragment key={`${item.label}-${index}`}>
                      <dt className="text-muted-foreground">{item.label}</dt>
                      <dd className="font-medium">{item.value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Editable Information</h3>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
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
            </div>

            {/* Conversion CTA (when qualified) */}
            {lead.status === 'qualified' && (
              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-900">Qualified Lead</CardTitle>
                  <CardDescription className="text-green-700">
                    This lead is qualified and can be converted into an opportunity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button type="button" size="sm" onClick={onConvert} disabled={isLoading}>
                    Convert to Opportunity
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer sticky */}
          <div className="sticky bottom-0 z-10 border-t bg-background px-6 py-4">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty || isLoading}>
                {isLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
