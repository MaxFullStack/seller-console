import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, TrendingUp, Info } from "lucide-react";
import { useLeadsMetrics } from "../hooks/use-leads-metrics";
import { formatPercentage, formatNumber } from "@/lib/utils";

export const LeadsCard = () => {
  const {
    totalLeads,
    newLeads,
    qualifiedLeads,
    unqualifiedLeads,
    contactedLeads,
    conversionRate,
  } = useLeadsMetrics();

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Leads</CardTitle>
              <CardDescription>Lead management overview</CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-lg font-semibold px-3 py-1"
            aria-label={`Total leads: ${formatNumber(totalLeads)}`}
          >
            {formatNumber(totalLeads)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Distribution - Mini Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Left Column */}
          <div className="space-y-2">
            <div className="text-center p-2 rounded-md bg-muted/30 dark:bg-muted/20 border border-border/50">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  New
                </span>
              </div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(newLeads)}
              </div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/30 dark:bg-muted/20 border border-border/50">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-1 h-1 rounded-full bg-orange-500 dark:bg-orange-400"></div>
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  Contacted
                </span>
              </div>
              <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                {formatNumber(contactedLeads)}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div className="text-center p-2 rounded-md bg-muted/30 dark:bg-muted/20 border border-border/50">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-1 h-1 rounded-full bg-green-500 dark:bg-green-400"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Qualified
                </span>
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatNumber(qualifiedLeads)}
              </div>
            </div>
            <div className="text-center p-2 rounded-md bg-muted/30 dark:bg-muted/20 border border-border/50">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-1 h-1 rounded-full bg-red-500 dark:bg-red-400"></div>
                <span className="text-xs font-medium text-red-700 dark:text-red-300">
                  Unqualified
                </span>
              </div>
              <div className="text-lg font-bold text-red-700 dark:text-red-300">
                {formatNumber(unqualifiedLeads)}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Rate - Responsive */}
        <div className="flex items-center justify-between pt-2 border-t space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-400" />
            <span className="text-sm font-medium">Conversion Rate</span>
            <Tooltip>
              <TooltipTrigger aria-label="Conversion rate information">
                <Info className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Percentage of leads converted to qualified status
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl font-bold text-green-700 dark:text-green-300">
              {formatPercentage(conversionRate)}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              Leads → Qualified
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
