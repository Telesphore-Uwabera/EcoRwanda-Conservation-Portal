import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/common/RoleGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import React from "react";
import ThreatMap from "./components/common/ThreatMap";

// Pages
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import WaitingForVerification from "./pages/auth/WaitingForVerification";

// Dashboard Pages
import VolunteerDashboard from "./pages/dashboard/VolunteerDashboard";
import ResearcherDashboard from "./pages/dashboard/ResearcherDashboard";
import RangerDashboard from "./pages/dashboard/RangerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Volunteer Pages
import SubmitReport from "./pages/volunteer/SubmitReport";
import MyReports from "./pages/volunteer/MyReports";
import ViewProjects from "./pages/volunteer/ViewProjects";
import VolunteerRequests from "./pages/volunteer/VolunteerRequests";
import VolunteerRequestDetails from "./pages/volunteer/VolunteerRequestDetails";
import MyApplications from "./pages/volunteer/MyApplications";
import VolunteerPublications from "./pages/volunteer/Publications";

// Researcher Pages
import PublishFindings from "./pages/researcher/PublishFindings";
import DataHub from "./pages/researcher/DataHub";
import RequestVolunteers from "./pages/researcher/RequestVolunteers";
import Analytics from "./pages/researcher/Analytics";
import Publications from "./pages/researcher/Publications";
import PublicationDetails from "./pages/researcher/PublicationDetails";
import DatasetDetails from "./pages/researcher/DatasetDetails";

// Ranger Pages
import VerifyReports from "./pages/ranger/VerifyReports";
import PatrolData from "./pages/ranger/PatrolData";
import Communications from "./pages/ranger/Communications";
import RangerAnalytics from "./pages/ranger/Analytics";
import Announcements from "./pages/ranger/Announcements";
import Chat from "./pages/ranger/Chat";
import Collaboration from "./pages/ranger/Collaboration";
import RangerPublications from "./pages/ranger/Publications";

// Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserProfileViewPage from "./pages/admin/UserProfileViewPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminChat from "./pages/admin/Chat";
import AdminCommunications from "./pages/admin/Communications";
import AdminCollaboration from "./pages/admin/Collaboration";
import AdminPublications from "./pages/admin/Publications";

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
            <Route
              path="/auth/reset-password/:token"
              element={<ResetPassword />}
            />
            <Route path="/auth/waiting-for-verification" element={<WaitingForVerification />} />

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
            <Route
              path="/volunteer/requests"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <VolunteerRequests />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/volunteer/request/:id"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <VolunteerRequestDetails />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/volunteer/my-applications"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <MyApplications />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/volunteer/Publications"
              element={
                <RoleGuard allowedRoles={["volunteer"]}>
                  <DashboardLayout>
                    <VolunteerPublications />
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
            <Route
              path="/researcher/analytics"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/researcher/threat-map"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <ThreatMap />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/researcher/publications"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <Publications />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/publications/:id"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <PublicationDetails />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/datasets/:id"
              element={
                <RoleGuard allowedRoles={["researcher"]}>
                  <DashboardLayout>
                    <DatasetDetails />
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
            <Route
              path="/ranger/communications"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <Communications />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/analytics"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <RangerAnalytics />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/announcements"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <Announcements />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/chat"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <Chat />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/collaboration"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <Collaboration />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/ranger/Publications"
              element={
                <RoleGuard allowedRoles={["ranger"]}>
                  <DashboardLayout>
                    <RangerPublications />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/user-management"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <UserManagementPage />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/user-profile/:userId"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <UserProfileViewPage />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/system-settings"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <SystemSettingsPage />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AnalyticsPage />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AdminAnnouncements />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/chat"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AdminChat />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/communications"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AdminCommunications />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/collaboration"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AdminCollaboration />
                  </DashboardLayout>
                </RoleGuard>
              }
            />
            <Route
              path="/admin/threat-map"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <ThreatMap />
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
            <Route
              path="/admin/Publications"
              element={
                <RoleGuard allowedRoles={["administrator"]}>
                  <DashboardLayout>
                    <AdminPublications />
                  </DashboardLayout>
                </RoleGuard>
              }
            />

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
