interface Project {
  id: string | number;
  projectCode: string;
  description?: string;
  division?: string;
  percentageComplete?: number;
  budgetAmount?: number;
  coAmount?: number;
  totalAmountSpent?: number;
  performanceCategory?: string;
  budgetStatusCategory?: string;
  issuesRisks?: number;
}

const formatCurrency = (amount: number | undefined | null) => {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return validAmount.toLocaleString();
};

export const exportToCSV = (projects: Project[], filename: string = 'projects') => {
  if (!projects || projects.length === 0) {
    alert('No data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Project Code',
    'Description',
    'Division',
    'Progress (%)',
    'Budget Amount (KSh)',
    'CO Amount (KSh)',
    'Amount Spent (KSh)',
    'Performance Status',
    'Budget Status',
    'Risks Count'
  ];

  // Convert projects to CSV rows
  const csvRows = projects.map(project => [
    project.projectCode || '',
    (project.description || '').replace(/,/g, ';'), // Replace commas to avoid CSV issues
    project.division || '',
    project.percentageComplete ? (project.percentageComplete * 100).toFixed(1) : '0',
    formatCurrency(project.budgetAmount),
    formatCurrency(project.coAmount),
    formatCurrency(project.totalAmountSpent),
    project.performanceCategory || '',
    project.budgetStatusCategory || '',
    project.issuesRisks?.toString() || '0'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToJSON = (projects: Project[], filename: string = 'projects') => {
  if (!projects || projects.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(projects, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getProjectSummary = (projects: Project[]) => {
  if (!projects || projects.length === 0) return null;

  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
  const totalCoAmount = projects.reduce((sum, p) => sum + (p.coAmount || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.totalAmountSpent || 0), 0);
  const totalRisks = projects.reduce((sum, p) => sum + (p.issuesRisks || 0), 0);

  const avgProgress = projects.reduce((sum, p) => sum + (p.percentageComplete || 0), 0) / totalProjects;

  return {
    totalProjects,
    totalBudget,
    totalCoAmount,
    totalSpent,
    totalRisks,
    avgProgress: (avgProgress * 100).toFixed(1) + '%',
    budgetUtilization: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) + '%' : '0%'
  };
};