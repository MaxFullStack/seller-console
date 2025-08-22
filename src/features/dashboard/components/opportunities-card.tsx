import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Target, BarChart3 } from 'lucide-react';
import { useOpportunitiesMetrics } from '../hooks/use-opportunities-metrics';
import { formatCurrencyCompact, formatPercentage, formatNumber } from '@/lib/utils';

export const OpportunitiesCard = () => {
  const {
    totalOpportunities,
    totalRevenue,
    averageDealSize,
    winRate,
    activeOpportunities,
  } = useOpportunitiesMetrics();


  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Opportunities</CardTitle>
              <CardDescription>Sales pipeline overview</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg font-semibold px-3 py-1" aria-label={`Total opportunities: ${totalOpportunities}`}>
            {totalOpportunities}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-muted/20 space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-700 dark:text-green-400" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatCurrencyCompact(totalRevenue)}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 dark:bg-muted/20 space-y-1 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              <span className="text-sm font-medium">Avg Deal Size</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {formatCurrencyCompact(averageDealSize)}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics - Responsive */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t">
          <div className="text-center p-2 sm:p-3 rounded-md bg-muted/30 dark:bg-muted/20 border border-border/50">
            <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Win Rate</div>
            <div className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300">{formatPercentage(winRate, 0)}</div>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-md bg-muted/30 dark:bg-muted/20 border border-border/50">
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Active</div>
            <div className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300">{formatNumber(activeOpportunities)}</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};