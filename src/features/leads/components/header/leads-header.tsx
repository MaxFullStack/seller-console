import { Button } from "@/components/ui/button";

interface LeadsHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export const LeadsHeader = ({ onRefresh, refreshing }: LeadsHeaderProps) => (
  <div className="mb-4 flex items-start justify-between gap-4 px-6 pt-4 sm:mb-2">
    <div className="min-w-0">
      <h1 className="truncate text-3xl font-bold tracking-tight">Leads</h1>
      <p className="text-muted-foreground">
        Manage your leads and convert them to opportunities
      </p>
    </div>
    <Button
      type="button"
      onClick={onRefresh}
      disabled={!!refreshing}
      className="shrink-0"
    >
      {refreshing ? "Refreshing..." : "Refresh"}
    </Button>
  </div>
);
