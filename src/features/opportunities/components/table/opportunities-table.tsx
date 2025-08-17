import { DataTable } from '@/components/table';
import { TableHeader } from '@/components/table';
import { opportunitiesColumns } from './opportunities-columns';
import { Opportunity } from '../../model/opportunity';
import { Button } from '@/components/ui/button';

export interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  onClearFilters: () => void;
}

export const OpportunitiesTable = ({
  opportunities,
  loading,
  error,
  onClearFilters,
}: OpportunitiesTableProps) => {
  const clearButton = (
    <Button variant="outline" size="sm" onClick={onClearFilters}>
      Clear Filters
    </Button>
  );

  return (
    <div className="space-y-4">
      <TableHeader
        count={opportunities.length}
        entityName="opportunit"
        actions={clearButton}
      />
      
      <DataTable
        columns={opportunitiesColumns}
        data={opportunities}
        loading={loading}
        error={error}
        initialSorting={[{ id: "amount", desc: true }]}
        initialPageSize={10}
        emptyMessage="No opportunities found."
      />
    </div>
  );
};