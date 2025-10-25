import { useState } from 'react'
import { Router, Route, Switch } from 'wouter'
import Dashboard from './pages/dashboard'
import AnalyticsDashboard from './pages/analytics-dashboard'
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">
        <TooltipProvider>
          <Toaster />
          <Router>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/analytics" component={AnalyticsDashboard} />
              <Route>
                <Dashboard />
              </Route>
            </Switch>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </>
  )
}

export default App
