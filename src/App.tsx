import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BoardPage from "./pages/BoardPage";
import CalculationBuilder from "./pages/CalculationBuilder";
import Header from "./components/Header";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data in cache for 5 minutes to help with navigation
      staleTime: 5 * 60 * 1000,
      // Don't refetch on window focus
      refetchOnWindowFocus: false,
    },
  },
});

// Layout component to wrap all routes with common elements
const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="flex-1">
      {children}
    </main>
  </>
);

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/board" element={<Layout><BoardPage /></Layout>} />
            <Route path="/operation" element={<Layout><CalculationBuilder /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
