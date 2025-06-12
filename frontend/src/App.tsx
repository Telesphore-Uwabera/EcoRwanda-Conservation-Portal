import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/common/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard Pages
import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import ResearcherDashboard from "./pages/dashboard/ResearcherDashboard";
import RangerDashboard from "./pages/dashboard/RangerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Volunteer Pages
import SubmitReport from "./pages/volunteer/SubmitReport";
import MyReports from "./pages/volunteer/MyReports";
import ViewProjects from "./pages/volunteer/ViewProjects";

// Researcher Pages
import PublishFindings from "./pages/researcher/PublishFindings";
import DataHub from "./pages/researcher/DataHub";
import RequestVolunteers from "./pages/researcher/RequestVolunteers";

// Ranger Pages
import VerifyReports from "./pages/ranger/VerifyReports";
import PatrolData from "./pages/ranger/PatrolData";
import ThreatMap from "./pages/ranger/ThreatMap";

// Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserProfileViewPage from "./pages/admin/UserProfileViewPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/volunteer"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <VolunteerDashboard />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/researcher"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <ResearcherDashboard />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/ranger"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <RangerDashboard />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Volunteer Routes */}
            <Route
              path="/volunteer/submit-report"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <SubmitReport />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/volunteer/my-reports"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <MyReports />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/volunteer/projects"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <ViewProjects />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Researcher Routes */}
            <Route
              path="/researcher/publish"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <PublishFindings />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/researcher/data-hub"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <DataHub />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/researcher/request-volunteers"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <RequestVolunteers />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Ranger Routes */}
            <Route
              path="/ranger/verify-reports"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <VerifyReports />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/patrol-data"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <PatrolData />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/threat-map"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <ThreatMap />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <UserManagementPage />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <UserProfileViewPage />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
