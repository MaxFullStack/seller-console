import type { ReactNode } from "react";

export interface TableHeaderProps {
  count: number;
  entityName: string;
  actions?: ReactNode;
}

export const TableHeader = ({
  count,
  entityName,
  actions,
}: TableHeaderProps) => {
  const pluralForm = count === 1 ? entityName : `${entityName}s`;

  return (
    <div className="flex justify-between items-center">
      <p className="text-sm text-muted-foreground">
        {count} {pluralForm} found
      </p>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};
