import { TableRow, TableCell } from "@/components/ui/table";

export interface TableEmptyProps {
  colSpan: number;
  message?: string;
}

export const TableEmpty = ({
  colSpan,
  message = "No results.",
}: TableEmptyProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        {message}
      </TableCell>
    </TableRow>
  );
};
