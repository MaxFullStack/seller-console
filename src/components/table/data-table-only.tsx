import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, SortingState, Table as TanStackTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTableSorting, useTableFilters } from "@/hooks/table";
import { TableLoading, TableEmpty } from "./";

interface DataTableOnlyProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (row: TData) => void;
  initialSorting?: SortingState;
  emptyMessage?: string;
  onTableChange?: (table: TanStackTable<TData>) => void;
}

export function DataTableOnly<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  onRowClick,
  initialSorting = [],
  emptyMessage = "No results.",
  onTableChange,
}: DataTableOnlyProps<TData, TValue>) {
  const { sorting, setSorting } = useTableSorting({ initialSorting });
  const { columnFilters, setColumnFilters } = useTableFilters();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    // Não incluimos pagination aqui
  });

  // Notifica parent sobre mudanças na tabela para controle da paginação
  if (onTableChange) {
    onTableChange(table);
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Container com scroll horizontal e vertical */}
      <div className="overflow-auto h-full scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        <Table className="min-w-[750px] w-full">
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="whitespace-nowrap bg-muted/50 font-semibold"
                    style={{ 
                      width: header.getSize(), 
                      minWidth: header.getSize() 
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableLoading columns={columns as ColumnDef<TData, unknown>[]} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`
                    border-b transition-colors
                    ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  `}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="py-3"
                      style={{ 
                        width: cell.column.getSize(), 
                        minWidth: cell.column.getSize() 
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableEmpty colSpan={columns.length} message={emptyMessage} />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}