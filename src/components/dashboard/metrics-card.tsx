import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Activity, Clock, Zap } from 'lucide-react';
import { useOverallMetrics } from '@/store/dashboard-store';
import { formatCurrency } from '@/lib/utils';

export const MetricsCard = () => {
  const { metrics, lastUpdated } = useOverallMetrics();

  const revenuePerLead = metrics.totalLeads > 0 ? metrics.totalRevenue / metrics.totalLeads : 0;
  const pipelineHealth = Math.round((metrics.conversionRate + metrics.opportunityConversionRate) / 2);
  
  const getHealthColor = (health: number) => {
    if (health >= 70) return 'text-green-600';
    if (health >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthLabel = (health: number) => {
    if (health >= 70) return 'Excellent';
    if (health >= 40) return 'Good';
    return 'Needs Attention';
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16" />
      
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
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatLastUpdated(lastUpdated)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pipeline Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pipeline Health</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getHealthColor(pipelineHealth)}`}>
                {pipelineHealth}%
              </div>
              <div className="text-xs text-muted-foreground">
                {getHealthLabel(pipelineHealth)}
              </div>
            </div>
          </div>
          <Progress value={pipelineHealth} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Lead Conv.</div>
            <div className="text-lg font-bold text-blue-600">{metrics.conversionRate}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Opp Conv.</div>
            <div className="text-lg font-bold text-green-600">{metrics.opportunityConversionRate}%</div>
          </div>
        </div>

        {/* Revenue Per Lead */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Revenue per Lead</span>
            <Badge variant="outline" className="font-mono">
              {formatCurrency(revenuePerLead)}
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold">{metrics.totalLeads}</div>
            <div className="text-xs text-muted-foreground">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{metrics.totalOpportunities}</div>
            <div className="text-xs text-muted-foreground">Opps</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-green-600">
              {formatCurrency(metrics.totalRevenue / 1000)}K
            </div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="flex items-center justify-center pt-2 border-t">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              Pipeline performing {pipelineHealth >= 50 ? 'well' : 'needs attention'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};