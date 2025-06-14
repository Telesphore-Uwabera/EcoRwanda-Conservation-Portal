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
  totalUsers: number;
  totalProjects: number;
  researchStudies: number;
  conservationAreas: number;
  totalParkRangers: number;
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  unverifiedUsers: number;
  userDistribution: {
    volunteers: number;
    researchers: number;
    rangers: number;
    administrators: number;
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
    totalUsers: 0,
    totalProjects: 0,
    researchStudies: 0,
    conservationAreas: 0,
    totalParkRangers: 0,
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    unverifiedUsers: 0,
    userDistribution: {
      volunteers: 0,
      researchers: 0,
      rangers: 0,
      administrators: 0,
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
        console.log('Unverified users count from backend:', response.data.unverifiedUsers);
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
              Central hub for system overview, user management, and data trends.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-800">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-900">
                    {stats.totalUsers.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-emerald-800">
                  Total Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <span className="text-2xl font-bold text-emerald-900">
                    {stats.totalReports.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-amber-800">
                  Reports Pending Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-2xl font-bold text-amber-900">
                    {stats.pendingReports.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Verified Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-900">
                    {stats.verifiedReports.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800">
                  Total Research Studies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-900">
                    {stats.researchStudies.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-800">
                  Total Conservation Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-900">
                    {stats.conservationAreas.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  User Distribution by Role
                </CardTitle>
                <CardDescription>Overview of user roles in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Volunteers', value: stats.userDistribution.volunteers },
                        { name: 'Researchers', value: stats.userDistribution.researchers },
                        { name: 'Rangers', value: stats.userDistribution.rangers },
                        { name: 'Admins', value: stats.userDistribution.administrators },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#4299e1" /> {/* blue */}
                      <Cell fill="#805ad5" /> {/* purple */}
                      <Cell fill="#ef4444" /> {/* red */}
                      <Cell fill="#a0aec0" /> {/* gray */}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-600"></span>
                    Volunteers: {stats.userDistribution.volunteers.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-purple-600"></span>
                    Researchers: {stats.userDistribution.researchers.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-600"></span>
                    Rangers: {stats.userDistribution.rangers.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-gray-600"></span>
                    Admins: {stats.userDistribution.administrators.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent System Activity
                </CardTitle>
                <CardDescription>Latest actions and updates across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center">No recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="pt-1">{getActivityIcon(activity.type)}</div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.user && `by ${activity.user} • `}
                            {activity.timestamp && new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-orange-600" />
                Project Status Overview
              </CardTitle>
              <CardDescription>Distribution of project statuses across the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.projectStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f97316" /> {/* orange-500 */}
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                {stats.projectStatus.map((statusItem) => (
                  <div key={statusItem._id} className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${getStatusColor(statusItem._id)}`}></span>
                    {statusItem._id}: {statusItem.count.toLocaleString()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                User Verification Status
              </CardTitle>
              <CardDescription>Overview of user verification process</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Verified', count: stats.totalUsers - stats.unverifiedUsers },
                  { name: 'Pending', count: stats.unverifiedUsers },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" /> {/* blue-500 */}
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600"></span>
                  Verified: {stats.totalUsers - stats.unverifiedUsers}
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-600"></span>
                  Pending: {stats.unverifiedUsers}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
