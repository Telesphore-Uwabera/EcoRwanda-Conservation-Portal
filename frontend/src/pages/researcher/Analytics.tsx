import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Database, Users, BarChart3 } from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import api from "@/config/api";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ResearcherStats {
  publishedFindings: number;
  activeProjects: number;
  volunteerCollaborators: number;
  datasetsAvailable: number;
}

interface ProjectStatus {
  status: string;
  count: number;
}

export default function Analytics() {
  const isOnline = useOfflineStatus();
  const [stats, setStats] = useState<ResearcherStats | null>(null);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }
        // Fetch researcher dashboard stats
        const response = await api.get('/researcher-dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        // Fetch datasetsAvailable from /data-hub
        const dataHubResponse = await api.get('/data-hub', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datasetsAvailable = dataHubResponse.data.datasetsAvailable || 0;
        setStats({
          publishedFindings: data.stats.publishedFindings,
          activeProjects: data.stats.activeProjects,
          volunteerCollaborators: data.stats.volunteerCollaborators,
          datasetsAvailable,
        });
        // If project status breakdown is available, set it. Otherwise, skip.
        if (data.activeProjects && Array.isArray(data.activeProjects)) {
          const statusMap: { [key: string]: number } = {};
          data.activeProjects.forEach((proj: any) => {
            statusMap[proj.status] = (statusMap[proj.status] || 0) + 1;
          });
          setProjectStatus(Object.entries(statusMap).map(([status, count]) => ({ status, count })));
        }
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

  return (
    <DashboardLayout>
      <div className="py-8">
        <OfflineIndicator isOnline={isOnline} />
        <h1 className="text-3xl font-bold mb-4">Research Analytics</h1>
        <p className="text-gray-600 mb-6">Analytics and insights about your research projects.</p>
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
              <StatCard icon={BookOpen} title="Published Findings" value={stats.publishedFindings} />
              <StatCard icon={BarChart3} title="Active Projects" value={stats.activeProjects} />
              <StatCard icon={Users} title="Volunteer Collaborators" value={stats.volunteerCollaborators} />
              <StatCard icon={Database} title="Datasets Available" value={stats.datasetsAvailable} />
            </div>
            {/* Project Status Bar Chart */}
            {projectStatus.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Active Project Status Overview</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={projectStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Projects" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 