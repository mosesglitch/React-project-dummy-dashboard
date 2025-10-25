import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface KpiData {
  totalProjects?: number;
  totalBudget?: number;
  totalSpent?: number;
}

interface KpiCardsProps {
  kpiData: KpiData | null;
}

const formatCurrency = (amount: number | undefined | null) => {
  const validAmount =
    typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  if (validAmount >= 1000000) {
    return `Ksh ${(validAmount / 1000000).toFixed(1)}M`;
  } else if (validAmount >= 1000) {
    return `Ksh ${(validAmount / 1000).toFixed(0)}K`;
  }
  return `Ksh ${validAmount.toLocaleString()}`;
};

export const KpiCards: React.FC<KpiCardsProps> = ({ kpiData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card data-testid="tile-total-projects">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpiData?.totalProjects
              ? Math.round(kpiData.totalProjects).toString()
              : '0'}
          </div>
          <p className="text-xs text-muted-foreground">Active portfolio</p>
        </CardContent>
      </Card>

      <Card data-testid="tile-total-budget">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpiData ? formatCurrency(kpiData.totalBudget) : '$0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Allocated funds estimate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="tile-actual-spend">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Actual Spend</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {kpiData ? formatCurrency(kpiData.totalSpent) : '$0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Current spending estimate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="tile-amount-received">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Amount Received</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {kpiData ? formatCurrency(97000000) : '$0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue collected estimate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="tile-total-risks">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">12</div>
          <p className="text-xs text-muted-foreground">Active risks</p>
        </CardContent>
      </Card>
    </div>
  );
};