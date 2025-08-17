import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useOpportunitiesMetrics } from '@/store/dashboard-store';
import { formatCurrency } from '@/lib/utils';

export const OpportunitiesCard = () => {
  const metrics = useOpportunitiesMetrics();

  const topStage = Object.entries(metrics.opportunitiesByStage)
    .sort(([,a], [,b]) => b - a)[0];

  const stageLabels: Record<string, string> = {
    'prospecting': 'Prospecting',
    'qualification': 'Qualification',
    'needs-analysis': 'Analysis',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed-won': 'Won',
    'closed-lost': 'Lost',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16" />
      
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
          <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
            {metrics.totalOpportunities}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.totalRevenue)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Avg Deal Size</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(metrics.averageDealSize)}
              </div>
            </div>
          </div>
        </div>

        {/* Top Stage */}
        {topStage && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Top Stage</span>
              <Badge variant="outline">
                {stageLabels[topStage[0]] || topStage[0]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Opportunities</span>
              <span className="text-lg font-bold">{topStage[1]}</span>
            </div>
          </div>
        )}

        {/* Stage Distribution */}
        <div className="space-y-2 pt-2 border-t">
          <span className="text-sm font-medium text-muted-foreground">Stage Breakdown</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(metrics.opportunitiesByStage)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([stage, count]) => (
                <div key={stage} className="flex justify-between">
                  <span className="text-muted-foreground truncate">
                    {stageLabels[stage] || stage}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Conversion Rate</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">
              {metrics.opportunityConversionRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              From qualified leads
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};