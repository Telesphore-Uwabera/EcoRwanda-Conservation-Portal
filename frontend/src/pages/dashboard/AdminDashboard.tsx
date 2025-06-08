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
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  status: string;
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
  totalResearch: number;
  totalConservation: number;
  userDistribution: {
    volunteers: number;
    researchers: number;
    rangers: number;
  };
  projectStatus: Array<{ _id: string; count: number }>;
  researchStatus: Array<{ _id: string; count: number }>;
  conservationStatus: Array<{ _id: string; count: number }>;
  recentActivities: {
    projects: Array<{
      title: string;
      description: string;
      status: string;
      createdAt: string;
      type: string;
    }>;
    research: Array<{
      title: string;
      description: string;
      status: string;
      createdAt: string;
      type: string;
    }>;
    conservation: Array<{
      title: string;
      description: string;
      status: string;
      createdAt: string;
      type: string;
    }>;
  };
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
    <div className="space-y-6 p-4">
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
                {stats.totalResearch.toLocaleString()}
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
                {stats.totalConservation.toLocaleString()}
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
                {stats.userDistribution.rangers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Administration Tools / Quick Actions */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Administration Tools
          </CardTitle>
          <CardDescription>
            Manage users, system settings, and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-blue-600 hover:bg-blue-700">
              <Link to="/admin/users" className="flex flex-col gap-1 items-center justify-center">
                <Users className="h-6 w-6" />
                <span>User Management</span>
              </Link>
            </Button>
            {/* You can add more admin actions here, e.g., Analytics, System Settings */}
             <Button asChild variant="outline" className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Link to="/admin/analytics" className="flex flex-col gap-1 items-center justify-center">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50">
              <Link to="/admin/settings" className="flex flex-col gap-1 items-center justify-center">
                <Settings className="h-6 w-6" />
                <span>System Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Distribution */}
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
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest project, research, and conservation updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...(stats.recentActivities.projects || []).map(p => ({...p, type: 'project_created'})),
              ...(stats.recentActivities.research || []).map(r => ({...r, type: 'research_added'})),
              ...(stats.recentActivities.conservation || []).map(c => ({...c, type: 'conservation_update'}))]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type || '')}</div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">Status: {activity.status}</p>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/activity-log">View All Activities</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
