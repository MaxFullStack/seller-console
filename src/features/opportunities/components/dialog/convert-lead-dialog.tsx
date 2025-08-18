import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lead } from '../../../leads/model/lead';
import { CreateOpportunityInput, OpportunityStage } from '../../model/opportunity';
import { validateAmount, validateName, validateCompanyName } from '@/lib/utils';

export interface ConvertLeadDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConvert: (input: CreateOpportunityInput) => Promise<void>;
  isLoading: boolean;
}

const stageOptions = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'needs-analysis', label: 'Needs Analysis' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
];

export const ConvertLeadDialog = ({
  lead,
  isOpen,
  onClose,
  onConvert,
  isLoading,
}: ConvertLeadDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    stage: 'prospecting' as OpportunityStage,
    amount: '',
    accountName: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    accountName: '',
    amount: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: `${lead.company} - Opportunity`,
        stage: 'prospecting',
        amount: '',
        accountName: lead.company,
      });
      setErrors({ name: '', accountName: '', amount: '' });
    }
  }, [lead]);

  const validateForm = () => {
    const newErrors = { name: '', accountName: '', amount: '' };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Opportunity name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be between 2-100 characters';
    }
    
    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    } else if (!validateCompanyName(formData.accountName)) {
      newErrors.accountName = 'Account name must be between 1-100 characters';
    }
    
    if (!validateAmount(formData.amount)) {
      newErrors.amount = 'Amount must be a valid number between 0 and 999,999,999';
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.accountName && !newErrors.amount;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!lead || !validateForm()) return;
    try {
      await onConvert({
        name: formData.name.trim(),
        stage: formData.stage,
        amount: formData.amount ? Number(formData.amount) : undefined,
        accountName: formData.accountName.trim(),
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

        <form onSubmit={handleSubmit} className="flex h-full flex-col">
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

              <div className="space-y-2">
                <Label htmlFor="name">Opportunity Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Opportunity name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-800">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Account/company name"
                  className={errors.accountName ? 'border-red-500' : ''}
                />
                {errors.accountName && <p className="text-sm text-red-800">{errors.accountName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, stage: value as OpportunityStage }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && <p className="text-sm text-red-800">{errors.amount}</p>}
                <p className="text-sm text-muted-foreground">Estimated opportunity value</p>
              </div>
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
      </SheetContent>
    </Sheet>
  );
};
