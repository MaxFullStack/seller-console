import { SearchField } from "./search-field";
import { StageSelect, type StageOption } from "./stage-select";

interface OpportunityFiltersProps {
  query: string;
  onQueryChange: (v: string) => void;
  stage: StageOption;
  onStageChange: (v: StageOption) => void;
}

const OpportunityFilters = ({
  query,
  onQueryChange,
  stage,
  onStageChange,
}: OpportunityFiltersProps) => (
  <div className="flex min-w-0 flex-wrap items-center gap-3">
    <SearchField
      value={query}
      onChange={onQueryChange}
      className="min-w-[240px] flex-1"
    />
    <StageSelect value={stage} onChange={onStageChange} />
  </div>
);

export default OpportunityFilters;