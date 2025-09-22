import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import Dashboard from './pages/dashboard'
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
   
      <ThemeProvider defaultTheme="light" storageKey="dashboard-theme">
        <TooltipProvider>
          <Toaster />
          <Dashboard />
        </TooltipProvider>
      </ThemeProvider>
    </>
  )
}

export default App
