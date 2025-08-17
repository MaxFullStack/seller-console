import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Opportunity } from "../../model/opportunity"
import { formatCurrency, capitalizeFirst } from "@/lib/utils"

const getStageVariant = (stage: string) => {
  switch (stage) {
    case "qualified":
      return "default"
    case "proposal":
      return "secondary"
    case "negotiation":
      return "outline"
    case "closed-won":
      return "default"
    case "closed-lost":
      return "destructive"
    default:
      return "secondary"
  }
}

export const opportunitiesColumns: ColumnDef<Opportunity>[] = [
  {
    accessorKey: "name",
    size: 250,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium min-w-[220px]">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "accountName",
    size: 200,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Account
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="min-w-[180px]">{row.getValue("accountName")}</div>
    ),
  },
  {
    accessorKey: "stage",
    size: 150,
    header: "Stage",
    cell: ({ row }) => {
      const stage = row.getValue("stage") as string
      return (
        <div className="min-w-[130px]">
          <Badge variant={getStageVariant(stage)}>
            {capitalizeFirst(stage.replace('-', ' '))}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    size: 150,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number | undefined
      return (
        <div className="font-mono font-medium min-w-[120px] text-right">
          {amount ? formatCurrency(amount) : "—"}
        </div>
      )
    },
  },
]