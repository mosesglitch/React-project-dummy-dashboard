import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Navbar } from '@/components/navbar';
import {
  ArrowLeft,
  Plus,
  Settings,
  Download,
  Save,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Filter,
  Grid,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar,
  Building,
  Users,
  GripVertical,
  Move,
  Edit,
  CheckCircle,
  X,
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { DashboardFilters } from '@/lib/types';

// Available measures and dimensions for dynamic selection
export const AVAILABLE_MEASURES = [
  { id: 'budgetAmount', label: 'Budget Amount', type: 'currency' },
  { id: 'totalAmountSpent', label: 'Amount Spent', type: 'currency' },
  { id: 'percentageComplete', label: 'Progress %', type: 'percentage' },
  { id: 'issuesRisks', label: 'Issues/Risks Count', type: 'number' },
  { id: 'performanceIndex', label: 'Performance Index', type: 'decimal' },
  { id: 'projectedGrossMargin', label: 'Projected Margin', type: 'percentage' },
  { id: 'actualGrossMargin', label: 'Actual Margin', type: 'percentage' },
  { id: 'deviationProfitMargin', label: 'Margin Deviation', type: 'percentage' },
];

export const AVAILABLE_DIMENSIONS = [
  { id: 'division', label: 'Division' },
  { id: 'performanceCategory', label: 'Performance Status' },
  { id: 'budgetStatusCategory', label: 'Budget Status' },
  { id: 'projectCode', label: 'Project Code' },
  { id: 'description', label: 'Project Description' },
  { id: 'startDate', label: 'Start Date', type: 'date' },
  { id: 'finishDate', label: 'Finish Date', type: 'date' },
];

// Widget types for the component library
export interface AnalyticsWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'filter';
  title: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: { x: number; y: number };
  config: {
    measures?: string[];
    dimensions?: string[];
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
    showTrend?: boolean;
    customTitle?: string;
  };
}

// Available widget templates
const WIDGET_TEMPLATES = [
  {
    id: 'budget-performance',
    type: 'chart' as const,
    title: 'Budget vs Performance',
    icon: BarChart3,
    description: 'Compare budget utilization against project performance',
    defaultSize: 'large' as const,
  },
  {
    id: 'project-timeline',
    type: 'chart' as const,
    title: 'Project Timeline Analysis',
    icon: LineChart,
    description: 'Track project progress over time',
    defaultSize: 'large' as const,
  },
  {
    id: 'division-breakdown',
    type: 'chart' as const,
    title: 'Division Performance',
    icon: PieChart,
    description: 'Performance breakdown by division',
    defaultSize: 'medium' as const,
  },
  {
    id: 'risk-analysis',
    type: 'chart' as const,
    title: 'Risk Distribution',
    icon: AlertTriangle,
    description: 'Analysis of project risks and issues',
    defaultSize: 'medium' as const,
  },
  {
    id: 'budget-kpi',
    type: 'kpi' as const,
    title: 'Budget KPIs',
    icon: DollarSign,
    description: 'Key budget and financial metrics',
    defaultSize: 'small' as const,
  },
  {
    id: 'performance-kpi',
    type: 'kpi' as const,
    title: 'Performance KPIs',
    icon: Target,
    description: 'Project performance indicators',
    defaultSize: 'small' as const,
  },
  {
    id: 'projects-table',
    type: 'table' as const,
    title: 'Projects Data Table',
    icon: Table,
    description: 'Detailed project information table',
    defaultSize: 'large' as const,
  },
  {
    id: 'data-filters',
    type: 'filter' as const,
    title: 'Data Filters',
    icon: Filter,
    description: 'Interactive data filtering controls',
    defaultSize: 'medium' as const,
  },
];

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'all',
    division: 'all',
    budgetStatus: 'all',
    performanceStatus: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [widgets, setWidgets] = useState<AnalyticsWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [isConfiguringWidget, setIsConfiguringWidget] = useState(false);
  const [configWidget, setConfigWidget] = useState<AnalyticsWidget | null>(null);
  const [dashboardTitle, setDashboardTitle] = useState('Custom Analytics Dashboard');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

  // Drag and drop state
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);

  // Get data using existing hook
  const {
    projects,
    kpiData,
    performanceStats,
    spendingStats,
    divisionStats,
    topProjects,
    projectsLoading,
  } = useDashboardData(filters);

  // Load dashboard configuration on initial load
  useEffect(() => {
    // Check for URL configuration first
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');

    if (configParam) {
      try {
        const dashboardConfig = JSON.parse(atob(configParam));
        setDashboardTitle(dashboardConfig.title || 'Shared Analytics Dashboard');
        setFilters(dashboardConfig.filters || filters);

        // Load widgets from shared config
        if (dashboardConfig.widgets && dashboardConfig.widgets.length > 0) {
          const sharedWidgets = dashboardConfig.widgets.map((w: any, index: number) => ({
            id: `${w.id || w.type}-${Date.now()}-${index}`,
            type: w.type,
            title: w.title,
            size: w.size || 'medium',
            position: { x: index % 3, y: Math.floor(index / 3) },
            config: {},
          }));
          setWidgets(sharedWidgets);
          return;
        }
      } catch (error) {
        console.warn('Failed to load shared dashboard configuration:', error);
      }
    }

    // Check for saved configuration in localStorage
    if (widgets.length === 0) {
      try {
        const savedConfig = localStorage.getItem('analytics-dashboard-config');
        if (savedConfig) {
          const dashboardConfig = JSON.parse(savedConfig);
          setDashboardTitle(dashboardConfig.title || 'Custom Analytics Dashboard');
          setFilters(dashboardConfig.filters || filters);
          setViewMode(dashboardConfig.viewMode || 'edit');

          if (dashboardConfig.widgets && dashboardConfig.widgets.length > 0) {
            setWidgets(dashboardConfig.widgets);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to load saved dashboard configuration:', error);
      }

      // Load default widgets if no saved configuration
      const defaultWidgets: AnalyticsWidget[] = [
        {
          id: 'budget-kpi-1',
          type: 'kpi',
          title: 'Budget Overview',
          size: 'small',
          position: { x: 0, y: 0 },
          config: { measures: ['budgetAmount', 'totalAmountSpent'], showTrend: true },
        },
        {
          id: 'division-chart-1',
          type: 'chart',
          title: 'Division Performance',
          size: 'medium',
          position: { x: 1, y: 0 },
          config: { chartType: 'pie', dimensions: ['division'], measures: ['budgetAmount'] },
        },
        {
          id: 'projects-table-1',
          type: 'table',
          title: 'Project Details',
          size: 'large',
          position: { x: 0, y: 1 },
          config: {
            dimensions: ['projectCode', 'division', 'performanceCategory'],
            measures: ['budgetAmount', 'totalAmountSpent', 'percentageComplete']
          },
        },
      ];
      setWidgets(defaultWidgets);
    }
  }, [widgets.length]);

  const addWidget = (templateId: string) => {
    const template = WIDGET_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const newWidget: AnalyticsWidget = {
      id: `${templateId}-${Date.now()}`,
      type: template.type,
      title: template.title,
      size: template.defaultSize,
      position: { x: 0, y: widgets.length },
      config: {
        measures: template.type === 'kpi' ? ['budgetAmount'] :
                 template.type === 'table' ? ['budgetAmount', 'totalAmountSpent'] :
                 ['budgetAmount'],
        dimensions: template.type === 'table' ? ['projectCode', 'division'] :
                   template.type === 'chart' ? ['division'] : [],
        chartType: template.type === 'chart' ? 'bar' : undefined,
      },
    };

    setWidgets([...widgets, newWidget]);
    setIsAddingWidget(false);
  };

  const configureWidget = (widget: AnalyticsWidget) => {
    setConfigWidget(widget);
    setIsConfiguringWidget(true);
  };

  const saveWidgetConfiguration = (updatedWidget: AnalyticsWidget) => {
    setWidgets(widgets.map(w =>
      w.id === updatedWidget.id ? updatedWidget : w
    ));
    setIsConfiguringWidget(false);
    setConfigWidget(null);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  };

  const duplicateWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const newWidget: AnalyticsWidget = {
      ...widget,
      id: `${widget.id}-copy-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      position: { x: widget.position.x, y: widget.position.y + 1 },
    };

    setWidgets([...widgets, newWidget]);
  };

  const updateWidget = (widgetId: string, updates: Partial<AnalyticsWidget>) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', widgetId);

    // Add dragging class to the element
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleDragOver = (e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedWidget && draggedWidget !== widgetId) {
      setDragOverWidget(widgetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Check if mouse is still inside the element
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverWidget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();

    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new array with swapped positions
    const newWidgets = [...widgets];
    const [draggedItem] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedItem);

    // Update position properties
    newWidgets.forEach((widget, index) => {
      widget.position = {
        x: index % 3,
        y: Math.floor(index / 3)
      };
    });

    setWidgets(newWidgets);
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleGridDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle dropping in empty grid areas if needed
    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  // Export and sharing handlers
  const handleSaveDashboard = () => {
    const dashboardConfig = {
      title: dashboardTitle,
      widgets: widgets,
      filters: filters,
      viewMode: viewMode,
      savedAt: new Date().toISOString(),
    };

    // Save to localStorage for persistence
    localStorage.setItem('analytics-dashboard-config', JSON.stringify(dashboardConfig));

    // Show success notification (would use proper notification system in production)
    alert('Dashboard saved successfully!');
  };

  const handleExportJSON = () => {
    const dashboardConfig = {
      title: dashboardTitle,
      widgets: widgets,
      filters: filters,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(dashboardConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportCSV = () => {
    if (!projects || projects.length === 0) {
      alert('No data available to export');
      return;
    }

    // Convert projects data to CSV
    const headers = ['Project Code', 'Description', 'Division', 'Budget Amount', 'Total Spent', 'Progress %', 'Performance Status', 'Budget Status', 'Issues/Risks'];
    const csvData = projects.map((project: any) => [
      project.projectCode || '',
      project.description || '',
      project.division || '',
      project.budgetAmount || 0,
      project.totalAmountSpent || 0,
      ((project.percentageComplete || 0) * 100).toFixed(1),
      project.performanceCategory || '',
      project.budgetStatusCategory || '',
      project.issuesRisks || 0,
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `projects-data-${new Date().toISOString().split('T')[0]}.csv`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handlePrintDashboard = () => {
    window.print();
  };

  const handleShareDashboard = async () => {
    const dashboardConfig = {
      title: dashboardTitle,
      widgets: widgets.map(w => ({ id: w.id, type: w.type, title: w.title, size: w.size })),
      filters: filters,
    };

    // Create shareable URL with dashboard configuration
    const configStr = btoa(JSON.stringify(dashboardConfig));
    const shareUrl = `${window.location.origin}${window.location.pathname}?config=${configStr}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Dashboard link copied to clipboard!');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Dashboard link copied to clipboard!');
    }
  };

  return (
    <>
      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            .print-break {
              page-break-after: always;
            }
            .drag-handle {
              display: none !important;
            }
            @page {
              margin: 1in;
            }
            body {
              print-color-adjust: exact;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="no-print">
          <Navbar />
        </div>

      <div className="px-4 md:px-6 lg:px-8 pt-6 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={dashboardTitle}
                    onChange={(e) => setDashboardTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className="text-2xl md:text-3xl font-bold h-12 border-2 border-blue-500"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => setIsEditingTitle(false)}
                    className="h-8"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {dashboardTitle}
                  </h1>
                  {viewMode === 'edit' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                Custom analytics and data exploration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 no-print">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
              className="flex items-center gap-2"
            >
              {viewMode === 'edit' ? <Maximize2 className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              {viewMode === 'edit' ? 'View Mode' : 'Edit Mode'}
            </Button>

            {viewMode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingWidget(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Widget
                </Button>
                {widgets.length > 1 && (
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                    <GripVertical className="h-3 w-3" />
                    Drag to reorder widgets
                  </div>
                )}
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleSaveDashboard()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportPDF()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportJSON()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCSV()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareDashboard()}>
                  <Copy className="h-4 w-4 mr-2" />
                  Share Dashboard Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePrintDashboard()}>
                  <Copy className="h-4 w-4 mr-2" />
                  Print Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Widget Addition Modal */}
        {isAddingWidget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Add Analysis Widget
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingWidget(false)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WIDGET_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
                        onClick={() => addWidget(template.id)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-3 text-base">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            {template.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {template.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {template.defaultSize}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Widget Configuration Modal */}
        {isConfiguringWidget && configWidget && (
          <WidgetConfigurationModal
            widget={configWidget}
            onSave={saveWidgetConfiguration}
            onClose={() => {
              setIsConfiguringWidget(false);
              setConfigWidget(null);
            }}
          />
        )}

        {/* Analytics Grid */}
        <div className="space-y-6">
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Widgets Added
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your custom analytics dashboard by adding widgets
              </p>
              <Button onClick={() => setIsAddingWidget(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Widget
              </Button>
            </div>
          ) : (
            <div
              ref={dragContainerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              onDrop={handleGridDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {widgets.map((widget) => (
                <AnalyticsWidgetRenderer
                  key={widget.id}
                  widget={widget}
                  isSelected={selectedWidget === widget.id}
                  isEditMode={viewMode === 'edit'}
                  isDragging={draggedWidget === widget.id}
                  isDragOver={dragOverWidget === widget.id}
                  onSelect={() => setSelectedWidget(widget.id)}
                  onRemove={() => removeWidget(widget.id)}
                  onDuplicate={() => duplicateWidget(widget.id)}
                  onConfigure={configureWidget}
                  onUpdate={(updates) => updateWidget(widget.id, updates)}
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, widget.id)}
                  data={{
                    projects,
                    kpiData,
                    performanceStats,
                    spendingStats,
                    divisionStats,
                    topProjects,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

// Widget Renderer Component
interface AnalyticsWidgetRendererProps {
  widget: AnalyticsWidget;
  isSelected: boolean;
  isEditMode: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConfigure: (widget: AnalyticsWidget) => void;
  onUpdate: (updates: Partial<AnalyticsWidget>) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  data: any;
}

function AnalyticsWidgetRenderer({
  widget,
  isSelected,
  isEditMode,
  isDragging,
  isDragOver,
  onSelect,
  onRemove,
  onDuplicate,
  onConfigure,
  onUpdate,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  data,
}: AnalyticsWidgetRendererProps) {
  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'md:col-span-1';
      case 'medium': return 'md:col-span-1 lg:col-span-2';
      case 'large': return 'md:col-span-2 lg:col-span-3';
      case 'xlarge': return 'md:col-span-3 lg:col-span-4';
      default: return 'md:col-span-1';
    }
  };

  return (
    <Card
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`${getSizeClass(widget.size)} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isDragOver ? 'ring-2 ring-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''} ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}
      transition-all duration-200 hover:shadow-md transform hover:-translate-y-1`}
      onClick={isEditMode ? onSelect : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          {isEditMode && (
            <div className="drag-handle cursor-grab hover:text-blue-600 transition-colors">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-1">
            {isDragging && (
              <Badge variant="secondary" className="text-xs">
                Moving...
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onConfigure(widget)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <WidgetContent widget={widget} data={data} />
      </CardContent>

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Move className="h-5 w-5" />
            Drop here to reorder
          </div>
        </div>
      )}
    </Card>
  );
}

// Widget Content Renderer
function WidgetContent({ widget, data }: { widget: AnalyticsWidget; data: any }) {
  switch (widget.type) {
    case 'kpi':
      return <KPIWidget widget={widget} data={data} />;
    case 'chart':
      return <ChartWidget widget={widget} data={data} />;
    case 'table':
      return <TableWidget widget={widget} data={data} />;
    case 'filter':
      return <FilterWidget widget={widget} data={data} />;
    default:
      return <div className="text-center text-gray-400">Widget type not implemented</div>;
  }
}

// Individual Widget Components (placeholder implementations)
function KPIWidget({ widget, data }: { widget: AnalyticsWidget; data: any }) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Ksh ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Ksh ${(amount / 1000).toFixed(0)}K`;
    }
    return `Ksh ${amount.toLocaleString()}`;
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      case 'number':
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get configured measures
  const selectedMeasures = widget.config.measures || ['budgetAmount'];
  const selectedDimensions = widget.config.dimensions || [];

  // Calculate aggregate values based on selected measures
  const getAggregateValue = (measureId: string) => {
    const projects = data.projects || [];
    if (projects.length === 0) return 0;

    switch (measureId) {
      case 'budgetAmount':
        return projects.reduce((sum: number, p: any) => sum + (p.budgetAmount || 0), 0);
      case 'totalAmountSpent':
        return projects.reduce((sum: number, p: any) => sum + (p.totalAmountSpent || 0), 0);
      case 'percentageComplete':
        return projects.reduce((sum: number, p: any) => sum + ((p.percentageComplete || 0) * 100), 0) / projects.length / 100;
      case 'issuesRisks':
        return projects.reduce((sum: number, p: any) => sum + (p.issuesRisks || 0), 0);
      case 'performanceIndex':
        return projects.reduce((sum: number, p: any) => sum + (p.performanceIndex || 0), 0) / projects.length;
      case 'projectedGrossMargin':
        return projects.reduce((sum: number, p: any) => sum + (p.projectedGrossMargin || 0), 0) / projects.length;
      case 'actualGrossMargin':
        return projects.reduce((sum: number, p: any) => sum + (p.actualGrossMargin || 0), 0) / projects.length;
      case 'deviationProfitMargin':
        return projects.reduce((sum: number, p: any) => sum + (p.deviationProfitMargin || 0), 0) / projects.length;
      default:
        return 0;
    }
  };

  // Generate KPI cards based on selected measures
  const getKPICards = () => {
    if (selectedMeasures.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <p>No measures selected</p>
          <p className="text-xs mt-1">Configure this widget to select measures to display</p>
        </div>
      );
    }

    const measureCards = selectedMeasures.slice(0, 4).map((measureId: string) => {
      const measure = AVAILABLE_MEASURES.find(m => m.id === measureId);
      if (!measure) return null;

      const currentValue = getAggregateValue(measureId);
      const prevValue = currentValue * 0.85; // Mock previous period data
      const trend = calculateTrend(currentValue, prevValue);

      const getColorClass = (measureId: string) => {
        switch (measureId) {
          case 'budgetAmount':
            return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
          case 'totalAmountSpent':
            return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
          case 'percentageComplete':
            return 'text-green-600 bg-green-50 dark:bg-green-900/20';
          case 'issuesRisks':
            return 'text-red-600 bg-red-50 dark:bg-red-900/20';
          case 'performanceIndex':
            return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
          default:
            return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
        }
      };

      return (
        <div key={measureId} className={`text-center p-3 rounded-lg ${getColorClass(measureId)}`}>
          <div className={`text-xl font-bold ${getColorClass(measureId).split(' ')[0]}`}>
            {formatValue(currentValue, measure.type)}
          </div>
          <div className="text-xs text-muted-foreground">{measure.label}</div>
          {widget.config.showTrend && (
            <div className={`text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </div>
          )}
        </div>
      );
    }).filter(Boolean);

    const gridCols = measureCards.length === 1 ? 'grid-cols-1' :
                    measureCards.length === 2 ? 'grid-cols-2' :
                    measureCards.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

    return (
      <div className="space-y-4">
        <div className={`grid ${gridCols} gap-3`}>
          {measureCards}
        </div>

        {/* Additional insights based on selected measures */}
        {selectedMeasures.includes('budgetAmount') && selectedMeasures.includes('totalAmountSpent') && (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Budget Utilization</span>
              <span className="text-xs font-medium">
                {((getAggregateValue('totalAmountSpent') / getAggregateValue('budgetAmount')) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((getAggregateValue('totalAmountSpent') / getAggregateValue('budgetAmount')) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {selectedDimensions.includes('performanceCategory') && (
          <div className="pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{data.projects?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Total Projects</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return getKPICards();
}

function ChartWidget({ widget, data }: { widget: AnalyticsWidget; data: any }) {
  // Get configured dimensions and measures
  const selectedDimensions = widget.config.dimensions || ['division'];
  const selectedMeasures = widget.config.measures || ['budgetAmount'];
  const chartType = widget.config.chartType || 'bar';

  const formatValue = (value: number, measureId: string) => {
    const measure = AVAILABLE_MEASURES.find(m => m.id === measureId);
    if (!measure) return value.toString();

    switch (measure.type) {
      case 'currency':
        return value >= 1000000 ? `Ksh ${(value / 1000000).toFixed(1)}M` :
               value >= 1000 ? `Ksh ${(value / 1000).toFixed(0)}K` :
               `Ksh ${value.toLocaleString()}`;
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(2);
      case 'number':
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };

  const getFieldValue = (project: any, fieldId: string) => {
    switch (fieldId) {
      case 'budgetAmount':
        return project.budgetAmount || 0;
      case 'totalAmountSpent':
        return project.totalAmountSpent || 0;
      case 'percentageComplete':
        return (project.percentageComplete || 0) * 100;
      case 'issuesRisks':
        return project.issuesRisks || 0;
      case 'performanceIndex':
        return project.performanceIndex || 0;
      case 'projectedGrossMargin':
        return (project.projectedGrossMargin || 0) * 100;
      case 'actualGrossMargin':
        return (project.actualGrossMargin || 0) * 100;
      case 'deviationProfitMargin':
        return (project.deviationProfitMargin || 0) * 100;
      case 'division':
        return project.division || 'Unknown';
      case 'performanceCategory':
        return project.performanceCategory || 'Unknown';
      case 'budgetStatusCategory':
        return project.budgetStatusCategory || 'Unknown';
      default:
        return project[fieldId] || 'Unknown';
    }
  };

  const renderBarChart = () => {
    const projects = data.projects?.slice(0, 8) || [];
    const primaryMeasure = selectedMeasures[0];
    const secondaryMeasure = selectedMeasures[1];

    if (!primaryMeasure) {
      return <div className="text-center text-gray-400">No measures selected for chart</div>;
    }

    const maxValue = Math.max(...projects.map((p: any) => getFieldValue(p, primaryMeasure)));

    return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
          {AVAILABLE_MEASURES.find(m => m.id === primaryMeasure)?.label || 'Chart Analysis'}
          {secondaryMeasure && ` vs ${AVAILABLE_MEASURES.find(m => m.id === secondaryMeasure)?.label}`}
        </div>
        {projects.map((project: any, index: number) => {
          const primaryValue = getFieldValue(project, primaryMeasure);
          const secondaryValue = secondaryMeasure ? getFieldValue(project, secondaryMeasure) : 0;
          const primaryWidth = maxValue > 0 ? (primaryValue / maxValue) * 100 : 0;
          const secondaryWidth = secondaryMeasure ?
            (secondaryValue / Math.max(...projects.map((p: any) => getFieldValue(p, secondaryMeasure)))) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate max-w-20">{project.projectCode}</span>
                <span>{formatValue(primaryValue, primaryMeasure)}</span>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {secondaryMeasure && (
                  <div
                    className="absolute h-full bg-blue-200 dark:bg-blue-800 rounded-full"
                    style={{ width: `${secondaryWidth}%` }}
                  />
                )}
                <div
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ width: `${primaryWidth}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-4 text-xs mt-2 pt-2 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>{AVAILABLE_MEASURES.find(m => m.id === primaryMeasure)?.label}</span>
          </div>
          {secondaryMeasure && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded"></div>
              <span>{AVAILABLE_MEASURES.find(m => m.id === secondaryMeasure)?.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const projects = data.projects || [];
    const primaryDimension = selectedDimensions[0];
    const primaryMeasure = selectedMeasures[0];

    if (!primaryDimension || !primaryMeasure) {
      return <div className="text-center text-gray-400">Select dimension and measure for pie chart</div>;
    }

    // Group data by dimension
    const groupedData = projects.reduce((acc: any, project: any) => {
      const dimensionValue = getFieldValue(project, primaryDimension);
      const measureValue = getFieldValue(project, primaryMeasure);

      if (!acc[dimensionValue]) {
        acc[dimensionValue] = 0;
      }
      acc[dimensionValue] += measureValue;

      return acc;
    }, {});

    const chartData = Object.entries(groupedData).map(([name, value]) => ({
      name,
      value: value as number,
    }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];

    return (
      <div className="space-y-4">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {AVAILABLE_MEASURES.find(m => m.id === primaryMeasure)?.label} by {AVAILABLE_DIMENSIONS.find(d => d.id === primaryDimension)?.label}
        </div>
        <div className="space-y-2">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                  <span className="text-xs truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[index % colors.length]} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-12 text-right">
                    {formatValue(item.value, primaryMeasure)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const projects = data.projects?.slice(0, 6) || [];
    const primaryMeasure = selectedMeasures[0];

    if (!primaryMeasure) {
      return <div className="text-center text-gray-400">No measures selected for line chart</div>;
    }

    return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {AVAILABLE_MEASURES.find(m => m.id === primaryMeasure)?.label} Progress
        </div>
        {projects.map((project: any, index: number) => {
          const value = getFieldValue(project, primaryMeasure);
          const progress = primaryMeasure === 'percentageComplete' ? value : (value / 100) * 100;
          const isOnTrack = project.performanceCategory?.toLowerCase().includes('track');
          const isDelayed = project.performanceCategory?.toLowerCase().includes('delay');

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="truncate max-w-24">{project.projectCode}</span>
                <Badge
                  variant="outline"
                  className={`text-xs h-4 ${
                    isOnTrack ? 'border-green-500 text-green-700' :
                    isDelayed ? 'border-red-500 text-red-700' :
                    'border-yellow-500 text-yellow-700'
                  }`}
                >
                  {formatValue(value, primaryMeasure)}
                </Badge>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isOnTrack ? 'bg-green-500' :
                    isDelayed ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAreaChart = () => {
    // For area chart, we'll show a stacked representation
    const projects = data.projects || [];
    const measures = selectedMeasures.slice(0, 3); // Limit to 3 measures for clarity

    if (measures.length === 0) {
      return <div className="text-center text-gray-400">No measures selected for area chart</div>;
    }

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

    return (
      <div className="space-y-4">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Multi-Measure Analysis
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {measures.map((measureId, index) => {
            const measure = AVAILABLE_MEASURES.find(m => m.id === measureId);
            const totalValue = projects.reduce((sum: number, p: any) => sum + getFieldValue(p, measureId), 0);
            const avgValue = projects.length > 0 ? totalValue / projects.length : 0;

            return (
              <div key={measureId} className={`p-2 ${colors[index].replace('bg-', 'bg-').replace('-500', '-50')} dark:${colors[index].replace('bg-', 'bg-').replace('-500', '-900/20')} rounded-lg`}>
                <div className={`text-lg font-bold ${colors[index].replace('bg-', 'text-')}`}>
                  {formatValue(measureId.includes('percentage') || measureId.includes('margin') ? avgValue : totalValue, measureId)}
                </div>
                <div className="text-xs text-muted-foreground">{measure?.label}</div>
              </div>
            );
          })}
        </div>
        {projects.length > 0 && (
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {measures.map((measureId, index) => {
              const totalValue = projects.reduce((sum: number, p: any) => sum + getFieldValue(p, measureId), 0);
              const maxTotal = Math.max(...measures.map(m =>
                projects.reduce((sum: number, p: any) => sum + getFieldValue(p, m), 0)
              ));
              const width = maxTotal > 0 ? (totalValue / maxTotal) * 100 : 0;

              return (
                <div
                  key={measureId}
                  className={`${colors[index]} h-full`}
                  style={{ width: `${width / measures.length}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const getChartContent = () => {
    if (selectedMeasures.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          <p>No measures selected</p>
          <p className="text-xs mt-1">Configure this widget to select measures to display</p>
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="h-48 overflow-y-auto">
      {getChartContent()}
    </div>
  );
}

function TableWidget({ widget, data }: { widget: AnalyticsWidget; data: any }) {
  const [sortField, setSortField] = useState<string>('projectCode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const projects = data.projects || [];

  // Get configured dimensions and measures
  const selectedDimensions = widget.config.dimensions || ['projectCode', 'division'];
  const selectedMeasures = widget.config.measures || ['budgetAmount', 'percentageComplete'];

  // Create column definitions based on configuration
  const getColumnDefinitions = () => {
    const columns = [];

    // Add dimension columns
    selectedDimensions.forEach(dimensionId => {
      const dimension = AVAILABLE_DIMENSIONS.find(d => d.id === dimensionId);
      if (dimension) {
        columns.push({
          id: dimensionId,
          label: dimension.label,
          type: 'dimension',
          sortable: true
        });
      }
    });

    // Add measure columns
    selectedMeasures.forEach(measureId => {
      const measure = AVAILABLE_MEASURES.find(m => m.id === measureId);
      if (measure) {
        columns.push({
          id: measureId,
          label: measure.label,
          type: 'measure',
          measureType: measure.type,
          sortable: true
        });
      }
    });

    return columns;
  };

  const columns = getColumnDefinitions();

  // Sort projects based on configured columns
  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = getFieldValue(a, sortField);
    const bValue = getFieldValue(b, sortField);

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    const numA = Number(aValue) || 0;
    const numB = Number(bValue) || 0;
    return sortDirection === 'asc' ? numA - numB : numB - numA;
  });

  // Get field value from project data
  function getFieldValue(project: any, fieldId: string) {
    switch (fieldId) {
      case 'projectCode':
        return project.projectCode || '';
      case 'description':
        return project.description || '';
      case 'division':
        return project.division || '';
      case 'performanceCategory':
        return project.performanceCategory || '';
      case 'budgetStatusCategory':
        return project.budgetStatusCategory || '';
      case 'budgetAmount':
        return project.budgetAmount || 0;
      case 'totalAmountSpent':
        return project.totalAmountSpent || 0;
      case 'percentageComplete':
        return (project.percentageComplete || 0) * 100;
      case 'issuesRisks':
        return project.issuesRisks || 0;
      case 'performanceIndex':
        return project.performanceIndex || 0;
      case 'projectedGrossMargin':
        return (project.projectedGrossMargin || 0) * 100;
      case 'actualGrossMargin':
        return (project.actualGrossMargin || 0) * 100;
      case 'deviationProfitMargin':
        return (project.deviationProfitMargin || 0) * 100;
      case 'startDate':
        return formatDate(project.startDate);
      case 'finishDate':
        return formatDate(project.finishDate);
      default:
        return project[fieldId] || '';
    }
  }

  // Format field value for display
  function formatFieldValue(project: any, column: any) {
    const value = getFieldValue(project, column.id);

    if (column.type === 'measure') {
      switch (column.measureType) {
        case 'currency':
          return formatCurrency(Number(value));
        case 'percentage':
          return `${Number(value).toFixed(1)}%`;
        case 'decimal':
          return Number(value).toFixed(2);
        case 'number':
          return Number(value).toString();
        default:
          return value.toString();
      }
    }

    return value.toString();
  }

  // Paginate projects
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Ksh ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Ksh ${(amount / 1000).toFixed(0)}K`;
    }
    return `Ksh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';

    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const jsDate = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
      return jsDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }

    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    }

    return 'N/A';
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('track')) return 'bg-green-100 text-green-700 border-green-300';
    if (statusLower.includes('delay') || statusLower.includes('critical')) return 'bg-red-100 text-red-700 border-red-300';
    if (statusLower.includes('behind')) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (columns.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No dimensions or measures selected</p>
        <p className="text-xs mt-1">Configure this widget to select data to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Dynamic Table Header */}
      <div className={`text-xs font-medium text-gray-600 dark:text-gray-400 grid gap-2 pb-2 border-b`}
           style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((column) => (
          <button
            key={column.id}
            onClick={() => handleSort(column.id)}
            className="text-left hover:text-blue-600 flex items-center gap-1 transition-colors truncate"
            title={column.label}
          >
            <span className="truncate">{column.label}</span>
            <span className="text-xs">{getSortIcon(column.id)}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Table Body */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {paginatedProjects.map((project: any, index: number) => (
          <div
            key={index}
            className={`text-xs grid gap-2 py-2 px-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-l-2 border-transparent hover:border-blue-400`}
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((column) => (
              <div key={column.id} className="truncate" title={formatFieldValue(project, column)}>
                {column.id === 'performanceCategory' || column.id === 'budgetStatusCategory' ? (
                  <Badge
                    variant="outline"
                    className={`text-xs h-fit w-fit px-2 py-0.5 ${getStatusColor(getFieldValue(project, column.id).toString())}`}
                  >
                    {getFieldValue(project, column.id).toString().replace(/[^a-zA-Z\s]/g, '') || 'N/A'}
                  </Badge>
                ) : column.id === 'percentageComplete' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 min-w-8">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Number(getFieldValue(project, column.id)), 100)}%` }}
                      />
                    </div>
                    <span className="font-medium min-w-8 text-right">
                      {Number(getFieldValue(project, column.id)).toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">
                    {formatFieldValue(project, column)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-gray-500">
            Showing {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, sortedProjects.length)} of {sortedProjects.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ←
            </button>
            <span className="text-xs px-2">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Summary Stats */}
      <div className="pt-2 border-t">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="font-medium text-blue-600">{sortedProjects.length}</div>
            <div className="text-gray-500">Projects</div>
          </div>
          {selectedMeasures.includes('budgetAmount') && (
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="font-medium text-green-600">
                {formatCurrency(sortedProjects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0))}
              </div>
              <div className="text-gray-500">Total Budget</div>
            </div>
          )}
          {selectedMeasures.includes('percentageComplete') && (
            <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
              <div className="font-medium text-orange-600">
                {sortedProjects.length > 0
                  ? ((sortedProjects.reduce((sum, p) => sum + ((p.percentageComplete || 0) * 100), 0) / sortedProjects.length).toFixed(0) + '%')
                  : '0%'
                }
              </div>
              <div className="text-gray-500">Avg Progress</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterWidget({ widget, data }: { widget: AnalyticsWidget; data: any }) {
  const [localFilters, setLocalFilters] = useState({
    division: 'all',
    status: 'all',
    budgetRange: [0, 100000000],
    progressRange: [0, 100],
    riskLevel: 'all',
    dateRange: 'all'
  });

  const [appliedCount, setAppliedCount] = useState(0);

  // Extract unique values from data
  const divisions = [...new Set(data.projects?.map((p: any) => p.division).filter(Boolean))] || [];
  const statuses = [...new Set(data.projects?.map((p: any) => p.performanceCategory).filter(Boolean))] || [];

  // Calculate budget range from actual data
  const budgets = data.projects?.map((p: any) => p.budgetAmount || 0) || [0];
  const minBudget = Math.floor(Math.min(...budgets) / 1000000) * 1000000;
  const maxBudget = Math.ceil(Math.max(...budgets) / 1000000) * 1000000;

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Count applied filters
    const activeFilters = Object.entries(newFilters).filter(([k, v]) => {
      if (k === 'budgetRange') return v[0] !== minBudget || v[1] !== maxBudget;
      if (k === 'progressRange') return v[0] !== 0 || v[1] !== 100;
      return v !== 'all';
    }).length;

    setAppliedCount(activeFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      division: 'all',
      status: 'all',
      budgetRange: [minBudget, maxBudget],
      progressRange: [0, 100],
      riskLevel: 'all',
      dateRange: 'all'
    };
    setLocalFilters(defaultFilters);
    setAppliedCount(0);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Ksh ${(amount / 1000000).toFixed(0)}M`;
    } else if (amount >= 1000) {
      return `Ksh ${(amount / 1000).toFixed(0)}K`;
    }
    return `Ksh ${amount.toLocaleString()}`;
  };

  // Filter statistics
  const filteredProjects = data.projects?.filter((project: any) => {
    if (localFilters.division !== 'all' && project.division !== localFilters.division) return false;
    if (localFilters.status !== 'all' && !project.performanceCategory?.toLowerCase().includes(localFilters.status)) return false;
    if (project.budgetAmount < localFilters.budgetRange[0] || project.budgetAmount > localFilters.budgetRange[1]) return false;
    const progress = (project.percentageComplete || 0) * 100;
    if (progress < localFilters.progressRange[0] || progress > localFilters.progressRange[1]) return false;
    if (localFilters.riskLevel !== 'all') {
      const riskCount = project.issuesRisks || 0;
      if (localFilters.riskLevel === 'low' && riskCount > 1) return false;
      if (localFilters.riskLevel === 'medium' && (riskCount <= 1 || riskCount > 3)) return false;
      if (localFilters.riskLevel === 'high' && riskCount <= 3) return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm">Filters</span>
          {appliedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {appliedCount} applied
            </Badge>
          )}
        </div>
        {appliedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs px-2 py-1 h-6"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Division Filter */}
      <div>
        <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">Division</label>
        <Select
          value={localFilters.division}
          onValueChange={(value) => handleFilterChange('division', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions ({data.projects?.length || 0})</SelectItem>
            {divisions.map((division) => (
              <SelectItem key={division} value={division}>
                {division} ({data.projects?.filter((p: any) => p.division === division).length || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">Performance Status</label>
        <Select
          value={localFilters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="track">On Track</SelectItem>
            <SelectItem value="delay">Delayed</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="behind">Behind Schedule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budget Range Filter */}
      <div>
        <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">
          Budget Range: {formatCurrency(localFilters.budgetRange[0])} - {formatCurrency(localFilters.budgetRange[1])}
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={minBudget}
            max={maxBudget}
            step={1000000}
            value={localFilters.budgetRange[0]}
            onChange={(e) => handleFilterChange('budgetRange', [parseInt(e.target.value), localFilters.budgetRange[1]])}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <input
            type="range"
            min={minBudget}
            max={maxBudget}
            step={1000000}
            value={localFilters.budgetRange[1]}
            onChange={(e) => handleFilterChange('budgetRange', [localFilters.budgetRange[0], parseInt(e.target.value)])}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Progress Range Filter */}
      <div>
        <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">
          Progress Range: {localFilters.progressRange[0]}% - {localFilters.progressRange[1]}%
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={localFilters.progressRange[0]}
            onChange={(e) => handleFilterChange('progressRange', [parseInt(e.target.value), localFilters.progressRange[1]])}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={localFilters.progressRange[1]}
            onChange={(e) => handleFilterChange('progressRange', [localFilters.progressRange[0], parseInt(e.target.value)])}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Risk Level Filter */}
      <div>
        <label className="text-xs font-medium mb-1 block text-gray-700 dark:text-gray-300">Risk Level</label>
        <Select
          value={localFilters.riskLevel}
          onValueChange={(value) => handleFilterChange('riskLevel', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk (0-1 issues)</SelectItem>
            <SelectItem value="medium">Medium Risk (2-3 issues)</SelectItem>
            <SelectItem value="high">High Risk (4+ issues)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Results Summary */}
      <div className="pt-3 border-t">
        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter Results ({filteredProjects.length} of {data.projects?.length || 0} projects)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
            <div className="font-medium text-blue-600">{filteredProjects.length}</div>
            <div className="text-gray-500">Projects</div>
          </div>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
            <div className="font-medium text-green-600">
              {formatCurrency(filteredProjects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0))}
            </div>
            <div className="text-gray-500">Total Budget</div>
          </div>
        </div>

        {/* Quick insights */}
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <div>Avg Progress: {(filteredProjects.reduce((sum, p) => sum + ((p.percentageComplete || 0) * 100), 0) / filteredProjects.length).toFixed(0)}%</div>
              <div>On Track: {filteredProjects.filter(p => p.performanceCategory?.toLowerCase().includes('track')).length}</div>
              <div>High Risk: {filteredProjects.filter(p => (p.issuesRisks || 0) > 3).length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Export Filtered Data */}
      <div className="pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          disabled={filteredProjects.length === 0}
        >
          <Download className="h-3 w-3 mr-1" />
          Export Filtered Data ({filteredProjects.length})
        </Button>
      </div>
    </div>
  );
}

// Widget Configuration Modal Component
interface WidgetConfigurationModalProps {
  widget: AnalyticsWidget;
  onSave: (widget: AnalyticsWidget) => void;
  onClose: () => void;
}

function WidgetConfigurationModal({ widget, onSave, onClose }: WidgetConfigurationModalProps) {
  const [configuredWidget, setConfiguredWidget] = useState<AnalyticsWidget>({ ...widget });

  const updateConfig = (updates: Partial<AnalyticsWidget['config']>) => {
    setConfiguredWidget(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  const updateBasic = (updates: Partial<AnalyticsWidget>) => {
    setConfiguredWidget(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(configuredWidget);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Configure Widget
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Widget Title</label>
                  <Input
                    value={configuredWidget.title}
                    onChange={(e) => updateBasic({ title: e.target.value })}
                    placeholder="Enter widget title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Widget Size</label>
                  <Select
                    value={configuredWidget.size}
                    onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateBasic({ size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1 column)</SelectItem>
                      <SelectItem value="medium">Medium (2 columns)</SelectItem>
                      <SelectItem value="large">Large (3 columns)</SelectItem>
                      <SelectItem value="xlarge">Extra Large (4 columns)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Data Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Data Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Measures Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Measures</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {AVAILABLE_MEASURES.map((measure) => (
                      <label key={measure.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={configuredWidget.config.measures?.includes(measure.id) || false}
                          onChange={(e) => {
                            const currentMeasures = configuredWidget.config.measures || [];
                            const newMeasures = e.target.checked
                              ? [...currentMeasures, measure.id]
                              : currentMeasures.filter(m => m !== measure.id);
                            updateConfig({ measures: newMeasures });
                          }}
                          className="rounded"
                        />
                        <span>{measure.label}</span>
                        <Badge variant="outline" className="text-xs">{measure.type}</Badge>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dimensions Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Dimensions</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {AVAILABLE_DIMENSIONS.map((dimension) => (
                      <label key={dimension.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={configuredWidget.config.dimensions?.includes(dimension.id) || false}
                          onChange={(e) => {
                            const currentDimensions = configuredWidget.config.dimensions || [];
                            const newDimensions = e.target.checked
                              ? [...currentDimensions, dimension.id]
                              : currentDimensions.filter(d => d !== dimension.id);
                            updateConfig({ dimensions: newDimensions });
                          }}
                          className="rounded"
                        />
                        <span>{dimension.label}</span>
                        {dimension.type && (
                          <Badge variant="outline" className="text-xs">{dimension.type}</Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Chart Type (for chart widgets) */}
                {configuredWidget.type === 'chart' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Chart Type</label>
                    <Select
                      value={configuredWidget.config.chartType || 'bar'}
                      onValueChange={(value: 'bar' | 'line' | 'pie' | 'area') => updateConfig({ chartType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Aggregation (for numeric measures) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Aggregation Method</label>
                  <Select
                    value={configuredWidget.config.aggregation || 'sum'}
                    onValueChange={(value: 'sum' | 'avg' | 'count' | 'max' | 'min') => updateConfig({ aggregation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum">Sum</SelectItem>
                      <SelectItem value="avg">Average</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="max">Maximum</SelectItem>
                      <SelectItem value="min">Minimum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Measures:</strong> {configuredWidget.config.measures?.length || 0} selected</p>
                  <p><strong>Dimensions:</strong> {configuredWidget.config.dimensions?.length || 0} selected</p>
                  <p><strong>Size:</strong> {configuredWidget.size}</p>
                  {configuredWidget.type === 'chart' && (
                    <p><strong>Chart Type:</strong> {configuredWidget.config.chartType || 'bar'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}