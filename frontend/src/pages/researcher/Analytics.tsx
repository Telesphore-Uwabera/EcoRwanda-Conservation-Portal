import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Database, Users, BarChart3 } from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import api from "@/config/api";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

interface ResearcherStats {
  publishedFindings: number;
  activeProjects: number;
  volunteerCollaborators: number;
  datasetsAvailable: number;
  totalProjects: number;
}

interface ProjectStatus {
  status: string;
  count: number;
}

const projectStatusColors = {
  planning: '#6366F1', // indigo
  'in progress': '#F59E42', // amber
  completed: '#10B981', // emerald
  cancelled: '#EF4444', // red
};

export default function Analytics() {
  const isOnline = useOfflineStatus();
  const [stats, setStats] = useState<ResearcherStats | null>(null);
  const [projectStatusBreakdown, setProjectStatusBreakdown] = useState<{ completed: number; active: number; planning: number }>({ completed: 0, active: 0, planning: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        let userId = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
          userId = user._id;
        }
        // Fetch all research projects for the user (correct endpoint)
        const projectsRes = await api.get(`/researchprojects/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const projects = projectsRes.data.data || [];
        const now = new Date();
        let completed = 0, active = 0, planning = 0;
        projects.forEach((p: any) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          if (end < now) completed++;
          else if (start > now) planning++;
          else active++;
        });
        // Fetch all volunteer requests for the user's projects
        const volunteerReqRes = await api.get(`/volunteer-requests?requestedBy=${userId}&populate=applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const volunteerRequests = volunteerReqRes.data.data || [];
        // Count unique accepted applicants
        const acceptedVolunteers = new Set();
        volunteerRequests.forEach((req: any) => {
          if (req.applications && Array.isArray(req.applications)) {
            req.applications.forEach((app: any) => {
              if (app.status === 'accepted' && app.applicant && app.applicant._id) {
                acceptedVolunteers.add(app.applicant._id);
              }
            });
          }
        });
        // Fetch datasetsAvailable from /data-hub
        const dataHubResponse = await api.get('/data-hub', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datasetsAvailable = dataHubResponse.data.datasetsAvailable || 0;
        setStats({
          totalProjects: projects.length,
          volunteerCollaborators: acceptedVolunteers.size,
          datasetsAvailable,
          publishedFindings: 0,
          activeProjects: active,
        });
        setProjectStatusBreakdown({ completed, active, planning });
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const StatCard = ({ icon: Icon, title, value }: { icon: any; title: string; value: number }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : 'N/A'}</div>
      </CardContent>
    </Card>
  );

  // For the bar chart, build the data array from projectStatusBreakdown
  const barChartData = [
    { status: 'Completed', count: projectStatusBreakdown.completed },
    { status: 'Active', count: projectStatusBreakdown.active },
    { status: 'Planning', count: projectStatusBreakdown.planning },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <OfflineIndicator isOnline={isOnline} />
        <h1 className="text-3xl font-bold mb-4">Research Analytics</h1>
      <p className="text-gray-600 mb-6">Analytics and insights about research projects.</p>
      {loading && <p>Loading analytics...</p>}
      {error && (
        <AlertDialog variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </AlertDialog>
      )}
      {!loading && !error && stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={BarChart3} title="Total Projects" value={stats.totalProjects} />
            <StatCard icon={Users} title="Volunteer Collaborators" value={stats.volunteerCollaborators} />
            <StatCard icon={Database} title="Datasets Available" value={stats.datasetsAvailable} />
          </div>
          {/* Project Status Bar Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Status Overview</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Projects">
                    {barChartData.map((item, idx) => (
                      <Cell key={item.status} fill={projectStatusColors[item.status.toLowerCase()] || '#8884d8'} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
      </div>
  );
} 