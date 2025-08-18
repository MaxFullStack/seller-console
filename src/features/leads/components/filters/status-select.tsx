import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StatusOption = "all" | "new" | "contacted" | "qualified" | "unqualified";

interface StatusSelectProps {
  value: StatusOption;
  onChange: (v: StatusOption) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as StatusOption)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="All Statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="contacted">Contacted</SelectItem>
        <SelectItem value="qualified">Qualified</SelectItem>
        <SelectItem value="unqualified">Unqualified</SelectItem>
      </SelectContent>
    </Select>
  );
}
