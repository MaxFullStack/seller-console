import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StageOption } from "../../hooks/use-opportunity-filters";

interface StageSelectProps {
  value: StageOption;
  onChange: (value: StageOption) => void;
}

const stageOptions: { value: StageOption; label: string }[] = [
  { value: "all", label: "All Stages" },
  { value: "prospecting", label: "Prospecting" },
  { value: "qualification", label: "Qualification" },
  { value: "needs-analysis", label: "Needs Analysis" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed-won", label: "Closed Won" },
  { value: "closed-lost", label: "Closed Lost" },
];

export const StageSelect = ({ value, onChange }: StageSelectProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="w-[160px]">
      <SelectValue placeholder="Filter by stage" />
    </SelectTrigger>
    <SelectContent>
      {stageOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export type { StageOption };
