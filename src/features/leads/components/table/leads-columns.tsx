import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lead } from "../../model/lead"
import { capitalizeFirst } from "@/lib/utils"

const getStatusVariant = (status: string) => {
  switch (status) {
    case "hot":
      return "destructive"
    case "warm":
      return "default"
    case "cold":
      return "secondary"
    case "new":
      return "outline"
    default:
      return "secondary"
  }
}

const getSourceColor = (source: string) => {
  switch (source) {
    case "website":
      return "bg-blue-100 text-blue-800"
    case "email":
      return "bg-green-100 text-green-800"
    case "phone":
      return "bg-yellow-100 text-yellow-800"
    case "referral":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

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
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
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
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
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
      <div className="text-muted-foreground min-w-[220px]">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "source",
    size: 120,
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as string
      return (
        <div className="min-w-[100px]">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(source)}`}
          >
            {capitalizeFirst(source)}
          </span>
        </div>
      )
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
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const score = row.getValue("score") as number
      return (
        <div className="font-mono font-medium min-w-[70px] text-center">
          {score}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    size: 120,
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="min-w-[100px]">
          <Badge variant={getStatusVariant(status)}>
            {capitalizeFirst(status)}
          </Badge>
        </div>
      )
    },
  },
]