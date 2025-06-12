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

  const [stats, setStats] = useState<DashboardStats | null>(null);
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
          Overview of system activities and user metrics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">
                {stats.totalUsers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-900">
                {stats.totalProjects.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">
              Research Studies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">
                {stats.researchStudies.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-800">
              Conservation Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-900">
                {stats.conservationAreas.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* New Card for Total Rangers */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Total Park Rangers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-900">
                {stats.totalParkRangers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* User Distribution & Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of users by role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Volunteers</span>
                <Badge className={getRoleColor("volunteer")}>
                  {stats.userDistribution.volunteers.toLocaleString()} users
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Researchers</span>
                <Badge className={getRoleColor("researcher")}>
                  {stats.userDistribution.researchers.toLocaleString()} users
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Rangers</span>
                <Badge className={getRoleColor("ranger")}>
                  {stats.userDistribution.rangers.toLocaleString()} users
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Administrators</span>
                <Badge className={getRoleColor("administrator")}>
                  {stats.userDistribution.administrators.toLocaleString()} users
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6 shadow-sm border rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 mr-2 text-orange-600" />
              Recent Activities
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Latest project, research, and conservation updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((activity, index) => (
                  <div
                    key={activity.id || activity.title + activity.createdAt + index} // Use ID if available, else a composite key
                    className="flex items-center space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                <p>No recent activities found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
      </div>
    </DashboardLayout>
  );
}
