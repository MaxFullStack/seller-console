import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead } from "../../model/lead";
import { capitalizeFirst } from "@/lib/utils";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "qualified":
      return "success"; // Success state - green
    case "unqualified":
      return "destructive"; // Error state - red
    case "contacted":
      return "secondary"; // In progress - neutral
    case "new":
      return "outline"; // New state - subtle
    default:
      return "secondary";
  }
};

export const leadsColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    size: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
          aria-label={`Sort by name ${column.getIsSorted() === "asc" ? "descending" : "ascending"}`}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium min-w-[180px]">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "company",
    size: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
          aria-label={`Sort by company ${column.getIsSorted() === "asc" ? "descending" : "ascending"}`}
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="min-w-[180px]">{row.getValue("company")}</div>
    ),
  },
  {
    accessorKey: "email",
    size: 250,
    header: "Email",
    cell: ({ row }) => (
      <div className="text-muted-foreground min-w-[220px]">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "source",
    size: 120,
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as string;
      return (
        <div className="min-w-[100px]">
          <span className="text-muted-foreground text-sm">
            {capitalizeFirst(source)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "score",
    size: 100,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
          aria-label={`Sort by score ${column.getIsSorted() === "asc" ? "descending" : "ascending"}`}
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const score = row.getValue("score") as number;
      return (
        <div className="font-mono font-medium min-w-[70px] text-center">
          {score}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    size: 120,
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="min-w-[100px]">
          <Badge variant={getStatusVariant(status)}>
            {capitalizeFirst(status)}
          </Badge>
        </div>
      );
    },
  },
];
