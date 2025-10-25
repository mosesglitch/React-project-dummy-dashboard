import React, { memo, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Table as TableIcon, Download, FileText, Database } from 'lucide-react';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { NotificationToast, useNotification } from '@/components/NotificationToast';

interface Project {
  id: string | number;
  projectCode: string;
  description?: string;
  division?: string;
  percentageComplete?: number;
  budgetAmount?: number;
  performanceCategory?: string;
  budgetStatusCategory?: string;
  issuesRisks?: number;
}

interface ProjectsTableProps {
  projects: Project[];
  projectsLoading: boolean;
  sortField: string | undefined;
  sortAsc: boolean;
  onSort: (field: string) => void;
  onProjectSelect: (projectId: string | number) => void;
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

const getStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('on track')) {
    return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
  } else if (statusLower.includes('delay')) {
    return <Badge className="bg-red-100 text-red-800">Delayed</Badge>;
  } else if (statusLower.includes('behind')) {
    return <Badge className="bg-yellow-100 text-yellow-800">Behind</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

const getBudgetStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('under')) {
    return <Badge className="bg-green-100 text-green-800">Under Budget</Badge>;
  } else if (statusLower.includes('within')) {
    return <Badge className="bg-blue-100 text-blue-800">Within Budget</Badge>;
  } else if (statusLower.includes('over')) {
    return <Badge className="bg-red-100 text-red-800">Over Budget</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

export const ProjectsTable: React.FC<ProjectsTableProps> = memo(({
  projects,
  projectsLoading,
  sortField,
  sortAsc,
  onSort,
  onProjectSelect,
  theme,
}) => {
  const sortedProjects = useMemo(() => [...(projects || [])].sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sortField) {
      case 'progress':
        aVal = (a.percentageComplete || 0) * 100;
        bVal = (b.percentageComplete || 0) * 100;
        break;
      case 'budget':
        aVal = a.budgetAmount;
        bVal = b.budgetAmount;
        break;
      case 'risks':
        aVal = a.issuesRisks || 0;
        bVal = b.issuesRisks || 0;
        break;
      case 'code':
        aVal = a.projectCode;
        bVal = b.projectCode;
        break;
      default:
        aVal = 0;
        bVal = 0;
    }

    // Numeric sort
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }

    // String sort
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return 0;
  }), [projects, sortField, sortAsc]);

  const { notification, showNotification, hideNotification } = useNotification();

  const handleExport = (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        exportToCSV(sortedProjects, 'projects_export');
        showNotification(`Successfully exported ${sortedProjects.length} projects to CSV`, 'success');
      } else {
        exportToJSON(sortedProjects, 'projects_export');
        showNotification(`Successfully exported ${sortedProjects.length} projects to JSON`, 'success');
      }
    } catch (error) {
      showNotification('Failed to export data. Please try again.', 'error');
    }
  };

  return (
    <Card data-testid="card-projects-table" className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
        <CardTitle className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <TableIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-lg font-semibold">Project Portfolio</span>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              data-testid="button-export-projects"
              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleExport('csv')}
              className="hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
            >
              <FileText className="h-4 w-4 mr-2 text-green-600" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport('json')}
              className="hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
            >
              <Database className="h-4 w-4 mr-2 text-purple-600" />
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto">
            <Table
              data-testid="table-projects"
              alternateRowColor={true}
              filterable={true}
              sortable={true}
            >
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow>
                  <TableHead
                    className="sticky top-0 left-0 bg-white dark:bg-gray-900 z-20 cursor-pointer"
                    onClick={() => onSort('code')}
                    filterable={true}
                  >
                    Project Code{' '}
                    {sortField === 'code' && (sortAsc ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                    Description
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                    Division
                  </TableHead>
                  <TableHead
                    className="sticky top-0 bg-white dark:bg-gray-900 z-10 cursor-pointer"
                    onClick={() => onSort('progress')}
                  >
                    Progress {sortField === 'progress' && (sortAsc ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="sticky top-0 bg-white dark:bg-gray-900 z-10 cursor-pointer"
                    onClick={() => onSort('budget')}
                  >
                    Budget {sortField === 'budget' && (sortAsc ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                    Status
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                    Budget Status
                  </TableHead>
                  <TableHead
                    className="sticky top-0 bg-white dark:bg-gray-900 z-10 cursor-pointer"
                    onClick={() => onSort('risks')}
                  >
                    Risks {sortField === 'risks' && (sortAsc ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white dark:bg-gray-900 z-10 w-12">
                    {/* Arrow column - no header text */}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {projectsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      Loading projects...
                    </TableCell>
                  </TableRow>
                ) : sortedProjects.length > 0 ? (
                  sortedProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => onProjectSelect(project.id)}
                      data-testid={`row-project-${project.projectCode}`}
                    >
                      <TableCell
                        className="font-medium sticky left-0 bg-white dark:bg-gray-900 z-10 text-blue-600 hover:underline cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectSelect(project.id);
                        }}
                      >
                        {project.projectCode}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={project.description}
                      >
                        {project.description}
                      </TableCell>
                      <TableCell>{project.division}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(project.percentageComplete || 0) * 100}
                            className="w-16 h-2"
                          />
                          <span className="text-sm text-gray-600">
                            {((project.percentageComplete || 0) * 100).toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(project.budgetAmount)}
                      </TableCell>
                      <TableCell>
                        {project.performanceCategory
                          ? getStatusBadge(project.performanceCategory)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {project.budgetStatusCategory
                          ? getBudgetStatusBadge(project.budgetStatusCategory)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (project.issuesRisks || 0) > 3
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {project.issuesRisks || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-12">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onProjectSelect(project.id);
                          }}
                          data-testid={`button-goto-project-${project.projectCode}`}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No projects found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </Card>
  );
});