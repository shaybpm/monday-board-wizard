
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

// Protected route component to ensure task is selected
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const hasTask = sessionStorage.getItem("mondayCurrentTask");
  
  if (!hasTask) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route 
              path="/board" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <BoardPage />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            <Route 
              path="/operation" 
              element={
                <Layout>
                  <ProtectedRoute>
                    <CalculationBuilder />
                  </ProtectedRoute>
                </Layout>
              } 
            />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
