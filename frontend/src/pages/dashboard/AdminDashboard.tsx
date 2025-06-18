import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api"; // Import your API instance
import {
  Users,
  BarChart3,
  Settings,
  Database,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  UserCheck,
  FileText,
  MapPin,
  FolderOpen,
  ClipboardList,
  FlaskConical,
  TreePine,
} from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Renamed to avoid conflict
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PendingVerification {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  organization: string;
  location: string;
  registeredAt: string;
  documents: string[];
}

// Define types for fetched data to match backend structure
interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  systemUptime: string;
}

interface UserMetrics {
  volunteers: { count: number; growth: number };
  researchers: { count: number; growth: number };
  rangers: { count: number; growth: number };
  administrators: { count: number; growth: number };
}

interface RecentActivity {
  id?: string; // Optional, if ID is not always present from backend
  type: string; // e.g., "user_registration", "project_created"
  title: string;
  description: string;
  user?: string; // Optional
  timestamp?: string; // Optional
  status: string;
  createdAt: string; // Used for sorting
}

interface SystemAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  time: string;
}

interface DashboardStats {
  totalProjects: number;
  researchStudies: number;
  conservationAreas: number;
  totalParkRangers: number;
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    verifiedUsers: number;
    userDistribution: {
      volunteers: number;
      researchers: number;
      rangers: number;
      administrators: number;
    };
  };
  projectStatus: Array<{ _id: string; count: number }>;
  researchStatus: Array<{ _id: string; count: number }>;
  conservationStatus: Array<{ _id: string; count: number }>;
  recentActivities: RecentActivity[]; // Correctly defined as an array of RecentActivity
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    researchStudies: 0,
    conservationAreas: 0,
    totalParkRangers: 0,
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      verifiedUsers: 0,
      userDistribution: {
        volunteers: 0,
        researchers: 0,
        rangers: 0,
        administrators: 0,
      },
    },
    projectStatus: [],
    researchStatus: [],
    conservationStatus: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      console.log('Attempting to fetch admin dashboard stats...');
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }

        console.log('Token being sent:', token ? 'Token exists' : 'No token');
        const response = await api.get('/admin-dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
        setError(null);
        console.log('Admin dashboard stats fetched successfully:', response.data);
        console.log('Total users count from backend:', response.data.userStats.totalUsers);
        console.log('Verified users count from backend:', response.data.userStats.verifiedUsers);
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
        console.log('Loading finished.');
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <AlertDialog variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </AlertDialog>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "project_created":
        return <FolderOpen className="h-4 w-4 text-emerald-600" />;
      case "research_added":
        return <FlaskConical className="h-4 w-4 text-purple-600" />;
      case "conservation_update":
        return <ClipboardList className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "planned":
        return "bg-purple-100 text-purple-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "volunteer":
        return "bg-emerald-100 text-emerald-800";
      case "researcher":
        return "bg-blue-100 text-blue-800";
      case "ranger":
        return "bg-purple-100 text-purple-800";
      case "administrator":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="space-y-6">
          <OfflineIndicator isOnline={isOnline} />

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Administrator Dashboard 📊
            </h1>
            <p className="text-gray-600">
              Overview of key metrics and recent activities across the EcoRwanda Conservation Portal.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Total Users</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.userStats.totalUsers}
                <Users className="h-8 w-8 text-blue-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Verified Users</CardTitle>
                <UserCheck className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.userStats.verifiedUsers}
                <CheckCircle className="h-8 w-8 text-green-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Total Projects</CardTitle>
                <FolderOpen className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.totalProjects}
                <FolderOpen className="h-8 w-8 text-amber-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Total Reports</CardTitle>
                <FileText className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.totalReports}
                <FileText className="h-8 w-8 text-purple-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Research Studies</CardTitle>
                <FlaskConical className="h-5 w-5 text-cyan-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.researchStudies}
                <FlaskConical className="h-8 w-8 text-cyan-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Conservation Areas</CardTitle>
                <TreePine className="h-5 w-5 text-lime-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.conservationAreas}
                <TreePine className="h-8 w-8 text-lime-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Park Rangers</CardTitle>
                <Shield className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.totalParkRangers}
                <Shield className="h-8 w-8 text-orange-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Pending Reports</CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.pendingReports}
                <Clock className="h-8 w-8 text-amber-600" />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md p-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Verified Reports</CardTitle>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.verifiedReports}
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </CardContent>
            </Card>
          </div>

          {/* User Verification Status Chart */}
          <Card className="bg-white rounded-xl shadow-md p-6">
            <CardHeader className="bg-gray-50 rounded-t-xl p-4 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">User Verification Status</CardTitle>
              <CardDescription className="text-gray-600">Overview of user verification process</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Verified', count: stats.userStats?.verifiedUsers || 0 },
                  { name: 'Pending', count: (stats.userStats?.totalUsers || 0) - (stats.userStats?.verifiedUsers || 0) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600"></span>
                  Verified: {stats.userStats?.verifiedUsers || 0}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-600"></span>
                  Pending: {(stats.userStats?.totalUsers || 0) - (stats.userStats?.verifiedUsers || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution Pie Chart */}
          <Card className="bg-white rounded-xl shadow-md p-6">
            <CardHeader className="bg-gray-50 rounded-t-xl p-4 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">User Role Distribution</CardTitle>
              <CardDescription className="text-gray-600">Breakdown of users by role across the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Volunteers', value: stats.userStats.userDistribution.volunteers },
                      { name: 'Researchers', value: stats.userStats.userDistribution.researchers },
                      { name: 'Rangers', value: stats.userStats.userDistribution.rangers },
                      { name: 'Administrators', value: stats.userStats.userDistribution.administrators },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    <Cell fill="#00C49F" /> {/* Green for Volunteers */}
                    <Cell fill="#0088FE" /> {/* Blue for Researchers */}
                    <Cell fill="#FFBB28" /> {/* Yellow for Rangers */}
                    <Cell fill="#FF8042" /> {/* Orange for Administrators */}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} users`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center text-gray-700">
                <p className="text-lg font-semibold">Total Users: {stats.userStats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>

          {/* Project Status Overview Chart */}
          <Card className="bg-white rounded-xl shadow-md p-6">
            <CardHeader className="bg-gray-50 rounded-t-xl p-4 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Project Status Overview</CardTitle>
              <CardDescription className="text-gray-600">Distribution of project statuses across the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.projectStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="bg-white rounded-xl shadow-md p-6">
            <CardHeader className="bg-gray-50 rounded-t-xl p-4 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Recent Activity Feed</CardTitle>
              <CardDescription className="text-gray-600">Latest events and actions within the portal</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentActivities.length > 0 ? (
                <ul className="space-y-4">
                  {stats.recentActivities
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5) // Display only the 5 most recent activities
                    .map((activity, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg shadow-sm">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                            {activity.title}
                            <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                          </h3>
                          <p className="text-gray-700 text-base">{activity.description}</p>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(activity.createdAt).toLocaleString()}</span>
                            {activity.user && <span className="ml-auto">By: {activity.user}</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-center py-10 text-gray-500 text-lg">
                  <Activity className="h-8 w-8 mx-auto mb-4" />
                  No recent activities.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
