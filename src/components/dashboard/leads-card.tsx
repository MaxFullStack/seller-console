import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Target, Star } from 'lucide-react';
import { useLeadsMetrics } from '@/store/dashboard-store';

export const LeadsCard = () => {
  const {
    totalLeads,
    newLeads,
    qualifiedLeads,
    unqualifiedLeads,
    contactedLeads,
    averageLeadScore,
    conversionRate,
  } = useLeadsMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />
      
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
          <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
            {totalLeads}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Distribution */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">New</span>
              <span className="font-medium">{newLeads}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contacted</span>
              <span className="font-medium">{contactedLeads}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">Qualified</span>
              <span className="font-medium text-green-600">{qualifiedLeads}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">Unqualified</span>
              <span className="font-medium text-red-600">{unqualifiedLeads}</span>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Avg Score</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getScoreColor(averageLeadScore)}`}>
                {averageLeadScore}
              </div>
              <div className="text-xs text-muted-foreground">
                {getScoreLabel(averageLeadScore)}
              </div>
            </div>
          </div>
          <Progress value={averageLeadScore} className="h-2" />
        </div>

        {/* Conversion Rate */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Conversion Rate</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {conversionRate}%
            </div>
            <div className="text-xs text-muted-foreground">
              To qualified
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};