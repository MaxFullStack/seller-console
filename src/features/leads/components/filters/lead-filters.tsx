import { SearchField } from "./search-field";
import { StatusSelect, type StatusOption } from "./status-select";


interface LeadsFiltersProps {
  query: string;
  onQueryChange: (v: string) => void;
  status: StatusOption;
  onStatusChange: (v: StatusOption) => void;
}

const LeadsFilters = ({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: LeadsFiltersProps) => (
  <div
    className="
      sticky top-[57px] z-10
      border-b bg-background/95 px-6 pb-4 pt-3 backdrop-blur
      supports-[backdrop-filter]:bg-background/60
    "
  >
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <SearchField
        value={query}
        onChange={onQueryChange}
        className="min-w-[240px] flex-1"
      />
      <StatusSelect value={status} onChange={onStatusChange} />
    </div>
  </div>
);

export default LeadsFilters