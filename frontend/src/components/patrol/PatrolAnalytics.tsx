import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface PatrolAnalyticsData {
  statusDistribution: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  monthlyPatrols: Array<{
    name: string;
    count: number;
  }>;
  totalPatrols: number;
  totalCompleted: number;
  totalInProgress: number;
  totalScheduled: number;
  averageDuration: number;
}

export function PatrolAnalytics() {
  const [timeRange, setTimeRange] = useState("month");
  const [analyticsData, setAnalyticsData] = useState<PatrolAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }

      const response = await api.get('/patrols/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching patrol analytics:', err);
      setError('Failed to load analytics data');
      toast({
        title: "Error",
        description: "Failed to load patrol analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Patrol Analytics</h2>
          <div className="w-[180px] h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 animate-pulse rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Patrol Analytics</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-gray-500">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for status distribution pie chart
  const statusData = [
    { name: "Scheduled", value: analyticsData.statusDistribution.scheduled },
    { name: "In Progress", value: analyticsData.statusDistribution.in_progress },
    { name: "Completed", value: analyticsData.statusDistribution.completed },
    { name: "Cancelled", value: analyticsData.statusDistribution.cancelled },
  ].filter(item => item.value > 0);

  // Prepare data for priority distribution bar chart
  const priorityData = [
    { name: "High", value: analyticsData.priorityDistribution.high },
    { name: "Medium", value: analyticsData.priorityDistribution.medium },
    { name: "Low", value: analyticsData.priorityDistribution.low },
  ].filter(item => item.value > 0);

  const patrolStatusColors = {
    Scheduled: '#6366F1', // indigo
    'In Progress': '#F59E42', // amber
    Completed: '#10B981', // emerald
    Cancelled: '#EF4444', // red
  };
  const patrolPriorityColors = {
    High: '#EF4444', // red
    Medium: '#F59E42', // amber
    Low: '#10B981', // emerald
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patrol Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:items-center sm:justify-end mb-4">
        <button
          className="btn btn-primary"
          onClick={fetchAnalytics}
        >
          Refresh Data
        </button>
        <button
          className="btn btn-outline"
          onClick={() => {/* download logic here */}}
        >
          Download Patrol Data
        </button>
        <button
          className="btn btn-outline"
          onClick={() => {/* view analytics logic here */}}
        >
          View Analytics
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patrols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalPatrols}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalInProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageDuration}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patrol Status Distribution</CardTitle>
              <CardDescription>Distribution of patrols by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={patrolStatusColors[entry.name] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patrols by Priority</CardTitle>
              <CardDescription>Number of patrols by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Number of Patrols">
                      {priorityData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={patrolPriorityColors[entry.name] || '#8884d8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Patrol Trends</CardTitle>
              <CardDescription>Patrol activity over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.monthlyPatrols}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Number of Patrols"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 