import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ProjectMap } from "@/components/dashboard/project-map";
import { FilterModal } from "@/components/filter-modal";
import type { DashboardFilters } from "@/lib/types";
import ProjectDetailsDashboard from "./project-details-dashboard";
import { useTheme } from "@/components/theme-provider";
import { useDashboardData } from "@/hooks/useDashboardData";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  KpiCardsSkeleton,
  ChartsSkeletonRow,
  ProjectsTableSkeleton
} from "@/components/LoadingSkeleton";
type Project = {
  code: string;
  budget: number;
  risks: number;
  progress: number;
};
export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    status: "all",
    division: "all",
    budgetStatus: "all",
    performanceStatus: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortAsc, setSortAsc] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | number | null
  >(null);

  // Use custom hook for data fetching
  const {
    projects,
    kpiData,
    performanceStats,
    spendingStats,
    divisionStats,
    topProjects,
    projectsLoading,
  } = useDashboardData(filters);

  const { theme } = useTheme();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleProjectSelect = (projectId: string | number) => {
    setSelectedProjectId(projectId);
    setIsProjectModalOpen(true);
  };
  if (
    selectedProjectId &&
    selectedProjectId !== "null" &&
    selectedProjectId !== "undefined"
  ) {
    return (
      <ProjectDetailsDashboard
        id={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="px-4 md:px-6 lg:px-8 pt-6 pb-8">
        {/* Header */}

        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Project Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage your project portfolio
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              data-testid="button-open-filters"
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {/* Filter indicator */}
          {(filters.division !== "all" ||
            filters.status !== "all" ||
            filters.budgetStatus !== "all" ||
            filters.performanceStatus !== "all" ||
            filters.dateFrom ||
            filters.dateTo) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Filters applied:
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFilters({
                      status: "all",
                      division: "all",
                      budgetStatus: "all",
                      performanceStatus: "all",
                      dateFrom: "",
                      dateTo: "",
                    })
                  }
                  className="h-6 px-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
        </div>

        {/* Main Dashboard Grid */}
        <div className="space-y-8">
          {/* KPI Cards */}
          <ErrorBoundary>
            <Suspense fallback={<KpiCardsSkeleton />}>
              <KpiCards kpiData={kpiData} />
            </Suspense>
          </ErrorBoundary>

          {/* Budget Overview Section */}
          {/* <div className="lg:col-span-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Budget Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Allocated:</span>
                        <span className="font-semibold">{kpiData ? formatCurrency(kpiData.totalBudget) : 'KSh 0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Spent:</span>
                        <span className="font-semibold text-orange-600">{kpiData ? formatCurrency(kpiData.actualSpend) : 'KSh 0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Received:</span>
                        <span className="font-semibold text-green-600">{kpiData ? formatCurrency(kpiData.amountReceived) : 'KSh 0'}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm text-muted-foreground">Available Budget:</span>
                        <span className="font-semibold text-blue-600">
                          {kpiData ? formatCurrency(Math.max(0, kpiData.totalBudget - kpiData.actualSpend)) : 'KSh 0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Budget Utilization</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Spent</span>
                          <span className="text-sm">{kpiData && kpiData.totalBudget > 0 ? ((kpiData.actualSpend / kpiData.totalBudget) * 100).toFixed(1) : '0'}%</span>
                        </div>
                        <Progress 
                          value={kpiData && kpiData.totalBudget > 0 ? (kpiData.actualSpend / kpiData.totalBudget) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Received</span>
                          <span className="text-sm">{kpiData && kpiData.totalBudget > 0 ? ((kpiData.amountReceived / kpiData.totalBudget) * 100).toFixed(1) : '0'}%</span>
                        </div>
                        <Progress 
                          value={kpiData && kpiData.totalBudget > 0 ? (kpiData.amountReceived / kpiData.totalBudget) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Budget Status</h3>
                    <div className="space-y-2">
                      {spendingStats ? (
                        Object.entries(spendingStats).map(([status, count]) => (
                          <div key={status} className="flex justify-between items-center">
                            <span className="text-sm">{status}:</span>
                            <Badge variant="outline" className="ml-2">
                              {count as number} projects
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No budget status data</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Charts and Data Visualization */}
          <ErrorBoundary>
            <Suspense fallback={<ChartsSkeletonRow />}>
              <ChartsSection
                projects={projects}
                divisionStats={divisionStats}
                topProjects={topProjects}
                filters={filters}
                setFilters={setFilters}
                theme={theme}
              />
            </Suspense>
          </ErrorBoundary>

          {/* Projects Table */}
          <ErrorBoundary>
            <Suspense fallback={<ProjectsTableSkeleton />}>
              <ProjectsTable
                projects={projects || []}
                projectsLoading={projectsLoading}
                sortField={sortField}
                sortAsc={sortAsc}
                onSort={handleSort}
                onProjectSelect={handleProjectSelect}
                theme={theme}
              />
            </Suspense>
          </ErrorBoundary>

          {/* Project Locations Map */}
          <ErrorBoundary>
            <div className="mt-6">
              <ProjectMap projects={projects || []} />
            </div>
          </ErrorBoundary>
        </div>

        {/* Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </div>
  );
}
