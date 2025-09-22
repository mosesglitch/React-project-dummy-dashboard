import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Temporarily remove problematic UI5 charts to fix runtime errors
// import {
//   PieChart,
//   DonutChart,
//   BarChart,
//   ColumnChart,
// } from "@ui5/webcomponents-react-charts";
import { Link } from "wouter";
// Fix default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
import type { ExcelProject } from "@shared/excel-schema";
import { parseLocation } from "@shared/excel-schema";
import type { DashboardFilters } from "@/lib/types";
import { dataService } from "@/lib/dataService";

export default function UI5Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    status: "all",
    division: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [, navigate] = useLocation();

  // Get data from local data service
  const projects = useMemo(() => {
    return dataService.getProjects({
      division: filters.division,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    });
  }, [filters]);
  
  const projectsLoading = false;
  const kpiData = useMemo(() => dataService.getOverviewStats(), []);
  const performanceStats = useMemo(() => dataService.getPerformanceCategoryStats(), []);
  const spendingStats = useMemo(() => dataService.getSpendingCategoriesStats(), []);
  const divisionStats = useMemo(() => dataService.getDivisionStats(), []);
  const projectLocations = useMemo(() => dataService.getAllProjectLocations(), []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Ksh ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Ksh ${(amount / 1000).toFixed(0)}K`;
    }
    return `Ksh ${amount.toLocaleString()}`;
  };

  // Function to reload data (now just refreshes the page)
  const reloadData = async () => {
    try {
      // Invalidate all queries to refetch data
      window.location.reload();
    } catch (error) {
      console.error("Failed to reload data:", error);
    }
  };

  // Sample locations for map when API fails
  const getSampleLocations = () => {
    if (!projects || projects.length === 0) {
      // Return default sample locations if no projects
      return [
        {
          id: "1",
          code: "51422",
          name: "Sample Project 1",
          locations: [{ lat: 39.7419, lng: -3.9389 }],
        },
        {
          id: "2",
          code: "51419",
          name: "Sample Project 2",
          locations: [{ lat: 39.6434, lng: -0.4571 }],
        },
      ];
    }

    return projects.slice(0, 3).map((project, index) => {
      const coords = [
        { lat: 39.7419, lng: -3.9389 },
        { lat: 39.6434, lng: -0.4571 },
        { lat: 34.768, lng: -0.0917 },
      ];
      return {
        id: project.id.toString(),
        code: project.projectCode,
        name: project.description,
        locations: [coords[index] || coords[0]],
      };
    });
  };

  const handleTableRowClick = (event: any) => {
    const row = event.detail?.row || event.target.closest("[data-project-id]");
    const projectId = row?.dataset?.projectId;
    if (projectId) {
      navigate(`/project/${projectId}`);
    }
  };

  // Helper functions to format chart data from API responses
  const formatChartData = (data: Record<string, number> | undefined) => {
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({ name: key, value }));
  };

  return (
    <div style={{ minHeight: "100vh" }}>
              Haloi
    </div>
  );
}
