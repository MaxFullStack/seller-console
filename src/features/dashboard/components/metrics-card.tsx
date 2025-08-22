import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, Info } from 'lucide-react';
import { useOverallMetrics } from '../hooks/use-overall-metrics';
import { formatCurrencyCompact, formatPercentage, formatNumber } from '@/lib/utils';

export const MetricsCard = () => {
  const {
    leads: { conversionRate, totalLeads },
    opportunities: { opportunityConversionRate, totalOpportunities, totalRevenue },
    revenuePerLead,
  } = useOverallMetrics();

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32"/>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Overall Metrics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Row - Responsive Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {/* Lead Conversion */}
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Lead Conversion</div>
              <Tooltip>
                <TooltipTrigger aria-label="Lead conversion information">
                  <Info className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Leads converted to qualified opportunities</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{formatPercentage(conversionRate)}</div>
          </div>

          {/* Opportunity Conversion */}
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-green-700 dark:text-green-300">Opp Conversion</div>
              <Tooltip>
                <TooltipTrigger aria-label="Opportunity conversion information">
                  <Info className="h-3 w-3 text-green-700 dark:text-green-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Opportunities converted to closed-won deals</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">{formatPercentage(opportunityConversionRate)}</div>
          </div>

          {/* Revenue per Lead */}
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Revenue/Lead</div>
              <Tooltip>
                <TooltipTrigger aria-label="Revenue per lead information">
                  <Info className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Total Revenue ÷ Total Leads (current period)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300">{formatCurrencyCompact(revenuePerLead)}</div>
          </div>

          {/* Total Revenue */}
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Total Revenue</div>
              <Tooltip>
                <TooltipTrigger aria-label="Total revenue information">
                  <Info className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Total revenue generated from all opportunities</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrencyCompact(totalRevenue)}</div>
          </div>
        </div>

        {/* Summary Stats - Responsive Layout */}
        <div className="flex items-center justify-center space-x-6 sm:space-x-12 pt-4 border-t">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{formatNumber(totalLeads)}</div>
            <div className="text-sm text-muted-foreground">Total Leads</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{formatNumber(totalOpportunities)}</div>
            <div className="text-sm text-muted-foreground">Opportunities</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};