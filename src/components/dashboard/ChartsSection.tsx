import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart } from 'lucide-react';
import {
  DonutChart,
  BarChart,
  ColumnChart,
} from '@ui5/webcomponents-react-charts';
import {
  NumericSideIndicator,
  AnalyticalCardHeader,
} from '@ui5/webcomponents-react';
import { DollarSign } from 'lucide-react';
import type { DashboardFilters } from '@/lib/types';

interface Project {
  id: string | number;
  projectCode: string;
  division?: string;
  coAmount?: number;
  budgetAmount?: number;
  totalAmountSpent?: number;
  performanceCategory?: string;
  budgetStatusCategory?: string;
  description?: string;
  deviationProfitMargin?: number;
  budgetSpent?: string;
}

interface ChartsData {
  division: string;
  projects: number;
}

interface ChartsSectionProps {
  projects: Project[] | null;
  divisionStats: ChartsData[] | null;
  topProjects: Project[];
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  theme: string;
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

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  projects,
  divisionStats,
  topProjects,
  filters,
  setFilters,
  theme,
}) => {
  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Division Projects Chart */}
        <Card data-testid="card-division-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Projects by Division
            </CardTitle>
          </CardHeader>
          <CardContent>
            {divisionStats &&
            Array.isArray(divisionStats) &&
            divisionStats.length > 0 ? (
              <BarChart
                dataset={divisionStats}
                dimensions={[{ accessor: 'name', label: 'Division' }]}
                measures={[{ accessor: 'projects', label: 'Projects' }]}
                style={{ height: '220px' }}
                onDataPointClick={(e) => {
                  const division = e?.detail.payload.name;
                  if (division) {
                    setFilters((prev) => ({
                      ...prev,
                      division,
                    }));
                  }
                }}
                onClick={() => {}}
                onLegendClick={() => {}}
              />
            ) : (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </CardContent>
        </Card>

        {/* CO Amount by Division Chart */}
        <Card data-testid="card-division-coamount-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              CO Amount by Division
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <DonutChart
                dataset={Object.values(
                  projects.reduce<
                    Record<string, { division: string; value: number }>
                  >((acc, project) => {
                    const div = project.division || 'Unknown';
                    if (!acc[div]) {
                      acc[div] = { division: div, value: 0 };
                    }
                    acc[div].value += Math.round(project.coAmount || 0);
                    return acc;
                  }, {})
                )}
                dimension={{ accessor: 'division' }}
                measure={{
                  accessor: 'value',
                  formatter: (val) => formatCurrency(Number(val)),
                }}
                onDataPointClick={(e) => {
                  const division = e?.detail.name;
                  if (division) {
                    setFilters((prev) => ({
                      ...prev,
                      division,
                    }));
                  }
                }}
                onClick={() => {}}
                onLegendClick={() => {}}
                style={{ height: '220px' }}
              />
            ) : (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </CardContent>
        </Card>

        {/* Performance Status Chart */}
        <Card data-testid="card-status-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Performance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <DonutChart
                dataset={Object.values(
                  projects.reduce<
                    Record<string, { category: string; value: number }>
                  >((acc, project) => {
                    const cat = project.performanceCategory || 'Unknown';
                    if (!acc[cat]) {
                      acc[cat] = { category: cat, value: 0 };
                    }
                    acc[cat].value += 1;
                    return acc;
                  }, {})
                )}
                dimension={{ accessor: 'category' }}
                measure={{ accessor: 'value' }}
                onDataPointClick={(e) => {
                  const performanceStatus = e?.detail.name;
                  if (performanceStatus) {
                    setFilters((prev) => ({
                      ...prev,
                      performanceStatus,
                    }));
                  }
                }}
                onClick={() => {}}
                onLegendClick={() => {}}
                style={{ height: '220px' }}
              />
            ) : (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </CardContent>
        </Card>

        {/* Budget Status Chart */}
        <Card data-testid="card-budget-status-chart">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <DonutChart
                dataset={Object.values(
                  projects.reduce<
                    Record<string, { status: string; value: number }>
                  >((acc, project) => {
                    const status = project.budgetStatusCategory || 'Unknown';
                    if (!acc[status]) {
                      acc[status] = { status, value: 0 };
                    }
                    acc[status].value += 1;
                    return acc;
                  }, {})
                )}
                dimension={{ accessor: 'status' }}
                measure={{ accessor: 'value' }}
                onDataPointClick={(e) => {
                  const budgetStatus = e?.detail.name;
                  if (budgetStatus) {
                    setFilters((prev) => ({
                      ...prev,
                      budgetStatus,
                    }));
                  }
                }}
                onClick={() => {}}
                onLegendClick={() => {}}
                style={{ height: '220px' }}
              />
            ) : (
              <span className="text-sm text-muted-foreground">No data</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Projects Chart */}
      {topProjects.length > 0 && (
        <Card data-testid="card-projects-chart">
          <AnalyticalCardHeader
            className={
              theme !== 'dark'
                ? 'bg-white/10 text-white'
                : 'bg-black/5 text-black'
            }
            description="Q3,2025"
            onClick={() => {}}
            state="Good"
            subtitleText="Current Profit Margin"
            titleText={
              <CardTitle className="flex items-center gap-2">
                <DollarSign
                  className={`h-4 w-4 ${
                    theme === 'dark'
                      ? 'text-gray-300'
                      : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={` ${
                    theme === 'dark' ? 'text-gray-300' : 'text-black'
                  }`}
                >
                  Top 15 Projects by CO amount
                </span>
              </CardTitle>
            }
            trend="Up"
            unitOfMeasurement="| Ksh"
            value={formatCurrency(
              Number(topProjects[0].coAmount || 0) -
                Number(topProjects[0].totalAmountSpent || 0)
            )}
          >
            <React.Fragment>
              <NumericSideIndicator
                number={formatCurrency(
                  Number(topProjects[0].coAmount || 0) -
                    Number(topProjects[0].budgetAmount || 0)
                )}
                titleText="Target Margin"
              />
              <NumericSideIndicator
                number={
                  topProjects[0].coAmount &&
                  topProjects[0].budgetAmount &&
                  topProjects[0].totalAmountSpent
                    ? (
                        ((topProjects[0].coAmount -
                          topProjects[0].totalAmountSpent -
                          (topProjects[0].coAmount -
                            topProjects[0].budgetAmount)) /
                          Math.max(
                            1,
                            topProjects[0].coAmount -
                              topProjects[0].budgetAmount
                          )) *
                        100
                      ).toFixed(1) + '%'
                    : '0%'
                }
                state="Critical"
                titleText="Deviation"
              />
            </React.Fragment>
          </AnalyticalCardHeader>

          <CardContent>
            <ColumnChart
              dataset={topProjects.map((p) => ({
                projectCode: p.projectCode.toString(),
                coAmount: p.coAmount || 0,
                budgetAmount: p.budgetAmount || 0,
                totalAmountSpent: p.totalAmountSpent || 0,
                description: p.description,
                deviationProfitMargin: p.deviationProfitMargin,
                budgetSpent: p.budgetSpent,
              }))}
              dimensions={[
                {
                  accessor: 'projectCode',
                  formatter: (val) => `#${val}`,
                },
              ]}
              measures={[
                {
                  accessor: 'coAmount',
                  label: 'CO Amount',
                  formatter: (val) => formatCurrency(val),
                },
                {
                  accessor: 'budgetAmount',
                  label: 'Budget Amount',
                  formatter: (val) => formatCurrency(val),
                },
                {
                  accessor: 'totalAmountSpent',
                  label: 'Actual Spent',
                  formatter: (val) => formatCurrency(val),
                },
              ]}
              tooltipConfig={{
                formatter: (value: any, name: string, props: any) => {
                  const datum = props.payload;
                  if (datum) {
                    return [
                      formatCurrency(value),
                      name,
                      <div
                        key="extra"
                        style={{ fontSize: '0.8em', marginTop: 4 }}
                      >
                        <div>Description: {datum.description}</div>
                        <div>Budget Spent: {datum.budgetSpent}</div>
                      </div>,
                    ];
                  }
                  return [formatCurrency(value), name];
                },
              }}
              onClick={() => {}}
              onDataPointClick={() => {}}
              onLegendClick={() => {}}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};