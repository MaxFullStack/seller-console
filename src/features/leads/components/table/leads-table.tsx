import { DataTable } from "@/components/table";
import { TableHeader } from "@/components/table";
import { leadsColumns } from "./leads-columns";
import { Lead } from "../../model/lead";
import { Button } from "@/components/ui/button";

export interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  onLeadSelect: (lead: Lead) => void;
  onClearFilters: () => void;
}

export const LeadsTable = ({
  leads,
  loading,
  error,
  onLeadSelect,
  onClearFilters,
}: LeadsTableProps) => {
  const clearButton = (
    <Button variant="outline" size="sm" onClick={onClearFilters}>
      Clear Filters
    </Button>
  );
  return (
    <div className="space-y-4">
      <TableHeader
        count={leads.length}
        entityName="lead"
        actions={clearButton}
      />

      <DataTable
        columns={leadsColumns}
        data={leads}
        loading={loading}
        error={error}
        onRowClick={onLeadSelect}
        initialSorting={[{ id: "score", desc: true }]}
        initialPageSize={10}
        emptyMessage="No leads found."
      />
    </div>
  );
};
