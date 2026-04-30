import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import Print from "./pages/Print";
import NotFound from "./pages/NotFound";
import { lazy, Suspense, useEffect } from "react";
import { loadCalculatorConfig } from "@/config/config-loader";
import { useAppStore } from "@/store/appStore";

// Admin page is only available in development. In production builds the
// /admin route is removed entirely so the panel cannot be accessed.
const Admin = import.meta.env.DEV
  ? lazy(() => import("./pages/Admin"))
  : null;

const queryClient = new QueryClient();

const App = () => {
  // Bootstrap: try to load runtime config from /calculator-config.json
  // (deep-merged over the built-in TS defaults). Falls back silently to
  // defaults if the file is missing or invalid.
  useEffect(() => {
    let cancelled = false;
    loadCalculatorConfig().then((cfg) => {
      if (cancelled) return;
      useAppStore.getState().setConfig(cfg);
    });
    return () => { cancelled = true; };
  }, []);

  return (
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
};

export default App;
