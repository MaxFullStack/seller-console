import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lead, UpdateLeadInput, LeadStatus } from '../../model/lead';
import { validateEmail } from '@/lib/utils';

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
];

export const LeadDetailPanel = ({
  lead,
  isOpen,
  onClose,
  onSave,
  onConvert,
  isLoading,
}: LeadDetailPanelProps) => {
  const [formData, setFormData] = useState({ email: '', status: 'new' as LeadStatus });
  const [errors, setErrors] = useState({ email: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({ email: lead.email, status: lead.status });
      setErrors({ email: '' });
      setHasChanges(false);
    }
  }, [lead]);

  const validateForm = () => {
    const newErrors = { email: '' };
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return !newErrors.email;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData((prev) => ({ ...prev, email: newEmail }));
    setHasChanges(true);
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!lead || !validateForm()) return;
    try {
      await onSave({ id: lead.id, email: formData.email.trim(), status: formData.status });
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Do you really want to cancel?');
      if (!confirmed) return;
    }
    onClose();
  };

  if (!lead) return null;

  // Campos prontos para escalar: adicione/retire sem mexer no layout
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
        <form onSubmit={handleSave} className="flex h-full flex-col">
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

            {/* Editáveis */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Editable Information</h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="email@empresa.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, status: value as LeadStatus }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CTA de conversão (quando qualificado) */}
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
              <Button type="submit" disabled={!hasChanges || isLoading}>
                {isLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
