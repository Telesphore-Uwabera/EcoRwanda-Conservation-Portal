import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import api from "@/config/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Activity } from "lucide-react";

interface AnalyticsData {
    statusDistribution: {
        scheduled: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };
    monthlyPatrols: { name: string; count: number }[];
    totalPatrols: number;
    totalIncidents: number;
}

export default function RangerAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/patrols/analytics', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAnalytics(response.data);
      } catch (err) {
        setError("Failed to load patrol analytics.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);
  
  const statusChartData = analytics ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })) : [];
  const COLORS = ['#FFBB28', '#3B82F6', '#10B981', '#EF4444'];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold">Patrol Analytics</h1>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Activity className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 bg-red-50 text-red-700 p-4 rounded-lg">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <p>{error}</p>
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Patrols & Incidents</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-around text-center">
                    <div>
                        <p className="text-4xl font-bold">{analytics.totalPatrols}</p>
                        <p className="text-muted-foreground">Total Patrols</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold">{analytics.totalIncidents}</p>
                        <p className="text-muted-foreground">Total Incidents Recorded</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Patrols by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Patrols Over Last 6 Months</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.monthlyPatrols}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false}/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2563eb" name="Patrols" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
            <p>No analytics data available.</p>
        )}
      </div>
    </DashboardLayout>
  );
}