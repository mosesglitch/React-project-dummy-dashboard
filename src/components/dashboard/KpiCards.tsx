import React, { memo } from 'react';
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

export const KpiCards: React.FC<KpiCardsProps> = memo(({ kpiData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
      <Card
        data-testid="tile-total-projects"
        className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none"
        role="article"
        aria-labelledby="total-projects-title"
        tabIndex={0}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle id="total-projects-title" className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Projects</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg" aria-hidden="true">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1" aria-live="polite">
            {kpiData?.totalProjects
              ? Math.round(kpiData.totalProjects).toString()
              : '0'}
          </div>
          <p className="text-xs text-muted-foreground">Active portfolio</p>
        </CardContent>
      </Card>

      <Card data-testid="tile-total-budget" className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Budget</CardTitle>
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {kpiData ? formatCurrency(kpiData.totalBudget) : 'Ksh 0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Allocated funds estimate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="tile-actual-spend" className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Actual Spend</CardTitle>
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {kpiData ? formatCurrency(kpiData.totalSpent) : 'Ksh 0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Current spending estimate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="tile-amount-received" className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Amount Received</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {kpiData ? formatCurrency(97000000) : 'Ksh 0'}
          </div>
          <p className="text-xs text-muted-foreground">
            Revenue collected estimate
          </p>
        </CardContent>
      </Card>

      <Card data-testid="tile-total-risks" className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Risks</CardTitle>
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">12</div>
          <p className="text-xs text-muted-foreground">Active risks</p>
        </CardContent>
      </Card>
    </div>
  );
});