import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextSimple";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardLayoutSimple from "./layouts/DashboardLayoutSimple";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Apps from "@/pages/Apps";
import AppInstall from "@/pages/AppInstall";
import DatabaseServices from "@/pages/DatabaseServices";
import Deployments from "@/pages/Deployments";
import Logs from "@/pages/Logs";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Domains from "@/pages/Domains";
import Pricing from "@/pages/Pricing";
import Webhooks from "@/pages/Webhooks";
import EnvironmentVariables from "@/pages/EnvironmentVariables";
import Backups from "@/pages/Backups";
import Team from "@/pages/Team";
import Landing from "@/pages/Landing";
import LoginSimple from "./pages/LoginSimple";
import RegisterSimple from "./pages/RegisterSimple";
import EmailConfirmedSimple from "./pages/EmailConfirmedSimple";
import InviteAccept from "./pages/InviteAccept";
import NotFound from "@/pages/NotFound";
// import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginSimple />} />
              <Route path="/register" element={<RegisterSimple />} />
              <Route path="/email-confirmed" element={<EmailConfirmedSimple />} />
              <Route path="/invite/accept" element={<InviteAccept />} />
              <Route path="/dashboard" element={<DashboardLayoutSimple />}>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="project/:id" element={<ProjectDetail />} />
                <Route path="apps" element={<Apps />} />
                <Route path="apps/install/:templateId" element={<AppInstall />} />
                <Route path="databases" element={<DatabaseServices />} />
                <Route path="deployments" element={<Deployments />} />
                <Route path="logs" element={<Logs />} />
                <Route path="domains" element={<Domains />} />
                <Route path="webhooks" element={<Webhooks />} />
                <Route path="environment" element={<EnvironmentVariables />} />
                <Route path="backups" element={<Backups />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="pricing" element={<Pricing />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
