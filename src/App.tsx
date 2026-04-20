import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import Print from "./pages/Print";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Admin page is only available in development. In production builds the
// /admin route is removed entirely so the panel cannot be accessed.
const Admin = import.meta.env.DEV
  ? lazy(() => import("./pages/Admin"))
  : null;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {Admin && (
              <Route
                path="/admin"
                element={
                  <Suspense fallback={null}>
                    <Admin />
                  </Suspense>
                }
              />
            )}
            <Route path="/print" element={<Print />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
