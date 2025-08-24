import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Opportunity,
  UpdateOpportunityInput,
  OpportunityStage,
} from "../../model/opportunity";

interface EditOpportunityDialogProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (input: UpdateOpportunityInput) => Promise<void>;
  isLoading: boolean;
}

// All stages available for editing
const stageOptions = [
  { value: "prospecting", label: "Prospecting" },
  { value: "qualification", label: "Qualification" },
  { value: "needs-analysis", label: "Needs Analysis" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed-won", label: "Closed Won" },
  { value: "closed-lost", label: "Closed Lost" },
] as const;

const editOpportunitySchema = z.object({
  name: z
    .string()
    .min(1, "Opportunity name is required")
    .min(3, "Opportunity name must be at least 3 characters")
    .max(100, "Opportunity name must be less than 100 characters"),
  accountName: z
    .string()
    .min(1, "Account name is required")
    .min(2, "Account name must be at least 2 characters")
    .max(100, "Account name must be less than 100 characters"),
  stage: z.enum([
    "prospecting",
    "qualification",
    "needs-analysis",
    "proposal",
    "negotiation",
    "closed-won",
    "closed-lost",
  ]),
  amount: z.union([
    z.string().length(0),
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number")
      .refine((val) => {
        const num = parseFloat(val);
        return num >= 0 && num <= 999999999;
      }, "Amount must be between 0 and 999,999,999"),
  ]),
});

type EditOpportunityFormData = z.infer<typeof editOpportunitySchema>;

export const EditOpportunityDialog = ({
  opportunity,
  isOpen,
  onClose,
  onUpdate,
  isLoading,
}: EditOpportunityDialogProps) => {
  const form = useForm<EditOpportunityFormData>({
    resolver: zodResolver(editOpportunitySchema),
    defaultValues: {
      name: "",
      accountName: "",
      stage: "prospecting",
      amount: "",
    },
  });

  // Update form when opportunity changes
  useEffect(() => {
    if (opportunity) {
      form.reset({
        name: opportunity.name,
        accountName: opportunity.accountName,
        stage: opportunity.stage,
        amount: opportunity.amount?.toString() || "",
      });
    }
  }, [opportunity, form]);

  const handleSubmit = async (data: EditOpportunityFormData) => {
    if (!opportunity) return;

    const previousStage = opportunity.stage;
    const newStage = data.stage as OpportunityStage;

    try {
      const updateInput: UpdateOpportunityInput = {
        id: opportunity.id,
        name: data.name.trim(),
        accountName: data.accountName.trim(),
        stage: newStage,
        amount: data.amount ? parseFloat(data.amount) : undefined,
      };

      await onUpdate(updateInput);

      // Show success toast based on stage change
      if (newStage === "closed-won" && previousStage !== "closed-won") {
        toast.success(
          `🎉 Opportunity "${data.name}" marked as Won! Revenue: $${data.amount || 0}`,
        );
      } else if (
        newStage === "closed-lost" &&
        previousStage !== "closed-lost"
      ) {
        toast.error(`Opportunity "${data.name}" marked as Lost.`);
      } else {
        toast.success(`Opportunity "${data.name}" updated successfully!`);
      }

      onClose();
    } catch {
      toast.error("Error updating opportunity. Please try again.");
    }
  };

  if (!opportunity) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Opportunity</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex h-full flex-col"
          >
            <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-28 space-y-6">
              {/* Current Opportunity Info */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Opportunity Details
                </h3>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-medium">{opportunity.id}</dd>
                  <dt className="text-muted-foreground">Current Stage</dt>
                  <dd className="font-medium capitalize">
                    {opportunity.stage.replace("-", " ")}
                  </dd>
                </dl>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Update Opportunity</h3>

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
                        <Input placeholder="Account name" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select opportunity stage" />
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
                      <p className="text-sm text-muted-foreground">
                        Estimated opportunity value
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer - Sticky buttons */}
            <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-6">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Updating..." : "Update Opportunity"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
