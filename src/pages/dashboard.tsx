import React, { useState } from "react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="px-4 md:px-6 pt-3">
        {/* Header */}

        {/* Filter Button */}
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Filter indicator */}
            {(filters.division !== "all" ||
              filters.status !== "all" ||
              filters.budgetStatus !== "all" ||
              filters.performanceStatus !== "all" ||
              filters.dateFrom ||
              filters.dateTo) && (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Filters applied
                  </div>
                  <Button
                    variant="destructive"
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
                    data-testid="button-open-filters"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            data-testid="button-open-filters"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Main Dashboard Grid */}
        <div className="space-y-6">
          {/* KPI Cards */}
          <KpiCards kpiData={kpiData} />

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
          <ChartsSection
            projects={projects}
            divisionStats={divisionStats}
            topProjects={topProjects}
            filters={filters}
            setFilters={setFilters}
            theme={theme}
          />

          {/* Projects Table */}
          <ProjectsTable
            projects={projects || []}
            projectsLoading={projectsLoading}
            sortField={sortField}
            sortAsc={sortAsc}
            onSort={handleSort}
            onProjectSelect={handleProjectSelect}
            theme={theme}
          />

          {/* Project Locations Map */}
          <div className="mt-6">
            <ProjectMap projects={projects || []} />
          </div>
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
