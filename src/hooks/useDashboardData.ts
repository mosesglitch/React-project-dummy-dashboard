import { useMemo } from 'react';
import { dataService } from '@/lib/dataService';
import type { DashboardFilters } from '@/lib/types';

export const useDashboardData = (filters: DashboardFilters) => {
  const projects = useMemo(() => {
    return dataService.getProjects({
      status: filters.status,
      division: filters.division,
      budgetStatus: filters.budgetStatus,
      performanceStatus: filters.performanceStatus,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  }, [filters]);

  const kpiData = useMemo(() => dataService.getOverviewStats(), []);

  const performanceStats = useMemo(
    () => dataService.getPerformanceCategoryStats(),
    []
  );

  const spendingStats = useMemo(
    () => dataService.getSpendingCategoriesStats(),
    []
  );

  const divisionStats = useMemo(() => dataService.getDivisionStats(), []);

  const topProjects = useMemo(() => {
    return [...(projects || [])]
      .sort((a, b) => (b.coAmount || 0) - (a.coAmount || 0))
      .slice(0, 15);
  }, [projects]);

  return {
    projects,
    kpiData,
    performanceStats,
    spendingStats,
    divisionStats,
    topProjects,
    projectsLoading: false,
  };
};