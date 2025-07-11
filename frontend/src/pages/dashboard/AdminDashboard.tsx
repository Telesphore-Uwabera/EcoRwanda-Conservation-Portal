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
  Map,
  BookCheck,
  ShieldCheck,
  UserX,
  Trees,
  Footprints,
  Users2,
  XCircle,
  Building,
  User,
} from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Renamed to avoid conflict
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format, isToday, isYesterday, differenceInHours, parseISO } from 'date-fns';

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
  rejectedReports?: number;
  investigatingReports?: number;
  resolvedReports?: number;
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
  latestReportDates?: {
    pending?: string;
    verified?: string;
    rejected?: string;
    investigating?: string;
    resolved?: string;
  };
  totalPatrols: number;
}

interface Activity {
  _id: string;
  message: string;
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  link?: string;
  createdAt: string;
}

const RecentActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get('/activities');
        if (res.data.success) {
          setActivities(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Group activities by date
  const groupByDate = (activityList: Activity[]) => {
    const groups: { [date: string]: Activity[] } = {};
    activityList.forEach(activity => {
      const date = format(parseISO(activity.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    // Sort groups by date descending
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  };

  // Split activities into recent (last 24h) and past
  const now = new Date();
  const recent = activities.filter(a => differenceInHours(now, new Date(a.createdAt)) < 24);
  const past = activities.filter(a => differenceInHours(now, new Date(a.createdAt)) >= 24);

  const renderGroups = (grouped: [string, Activity[]][]) => (
    <ul className="space-y-4">
      {grouped.map(([date, acts]) => (
        <React.Fragment key={date}>
          <li className="border-b pt-2 pb-1 mb-2 text-xs font-semibold text-gray-500">
            {isToday(parseISO(date)) ? 'Today' : isYesterday(parseISO(date)) ? 'Yesterday' : format(parseISO(date), 'MMMM d, yyyy')}
          </li>
          {acts.map(activity => (
            <li key={activity._id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                {activity.user ? activity.user.firstName.charAt(0) + activity.user.lastName.charAt(0) : 'SYS'}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {activity.message}
                  {activity.user && (
                    <> by <span className="font-semibold">{activity.user.firstName} {activity.user.lastName}</span></>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </li>
          ))}
        </React.Fragment>
      ))}
    </ul>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading activities...</p>
        ) : activities.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>No recent activities.</p>
          </div>
        ) : (
          <>
            {renderGroups(groupByDate(recent))}
            {past.length > 0 && !showPast && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowPast(true)}>
                  Show Past Activities
                </Button>
                </div>
            )}
            {showPast && renderGroups(groupByDate(past))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const navigate = useNavigate();

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
    totalPatrols: 0,
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

  // Add a date formatting helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No recent updates';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.userStats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Verified Users",
      value: stats.userStats.verifiedUsers,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Unverified Users",
      value: stats.userStats.totalUsers - stats.userStats.verifiedUsers,
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: ClipboardList,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Patrols",
      value: stats.totalPatrols,
      icon: Footprints,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Conservation Areas",
      value: stats.conservationAreas,
      icon: Trees,
      color: "text-teal-500",
      bgColor: "bg-teal-100",
    },
    {
      title: "Park Rangers",
      value: stats.totalParkRangers,
      icon: User,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Reports",
      value: stats.totalReports,
      icon: FileText,
      color: "text-indigo-500",
      bgColor: "bg-indigo-100",
    },
  ];

  const QuickActionButton = ({ icon: Icon, label, path, className }: { icon: React.ElementType, label: string, path: string, className?: string }) => (
    <Button
      variant="outline"
      className={`flex-1 min-w-[200px] bg-white hover:bg-gray-50 transition-all duration-200 ease-in-out transform hover:scale-105 ${className}`}
      onClick={() => navigate(path)}
    >
      <Icon className="h-5 w-5 mr-3" />
      <span className="font-semibold">{label}</span>
    </Button>
  );

  const getReportStatusAlert = () => {
    const statuses = [
      { status: 'pending', count: stats.pendingReports, date: stats.latestReportDates.pending, color: "amber" },
      { status: 'investigating', count: stats.investigatingReports, date: stats.latestReportDates.investigating, color: "blue" },
    ];

    const mostCritical = statuses.sort((a, b) => (b.date && a.date ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0))[0];
    
    if (mostCritical && mostCritical.count > 0) {
      return (
        <AlertDialog variant="destructive">
           <AlertTriangle className={`h-4 w-4 text-${mostCritical.color}-500`} />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            {mostCritical.count} report(s) are currently {mostCritical.status}. Please review them promptly.
          </AlertDescription>
        </AlertDialog>
      );
    }
    return null;
  };

  // Color maps for charts
  const verificationStatusColors = {
    Verified: '#10B981', // emerald
    Pending: '#F59E42', // amber
  };
  const userRoleColors = [
    '#00C49F', // Volunteers (green)
    '#0088FE', // Researchers (blue)
    '#FFBB28', // Rangers (yellow)
    '#FF8042', // Admins (orange)
  ];
  const projectStatusColors = {
    planning: '#6366F1', // indigo
    'in progress': '#F59E42', // amber
    completed: '#10B981', // emerald
    cancelled: '#EF4444', // red
  };

  return (
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
            {statCards.map((card, index) => {
              const Icon = card.icon; // Assign the component to a variable with a capitalized name
              return (
                <Card key={index} className={`bg-${card.bgColor} rounded-xl shadow-md p-6`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-gray-700">{card.title}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className={`text-${card.color} text-2xl font-bold`}>{card.value}</span>
                      <span className="text-gray-500"><Icon className="h-5 w-5" /></span>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Actions */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your platform efficiently</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton icon={Users2} label="User Management" path="/admin/user-management" />
                <QuickActionButton icon={ClipboardList} label="View Analytics" path="/admin/analytics" />
                <QuickActionButton icon={Map} label="Threat Map" path="/admin/threat-map" />
                <QuickActionButton icon={Settings} label="System Settings" path="/admin/system-settings" />
              </CardContent>
            </Card>
          </div>

          {/* Report Status Cards - Consistent Styling with Other Stat Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mt-6">
            {/* Pending Reports */}
            <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Pending Reports</CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.pendingReports ?? 0}
                <Clock className="h-8 w-8 text-amber-600" />
              </CardContent>
            </Card>
            {/* Verified Reports */}
            <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Verified Reports</CardTitle>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.verifiedReports ?? 0}
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </CardContent>
            </Card>
            {/* Rejected Reports */}
            <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Rejected Reports</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.rejectedReports ?? 0}
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </CardContent>
            </Card>
            {/* Investigating Reports */}
            <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Investigating Reports</CardTitle>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.investigatingReports ?? 0}
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </CardContent>
            </Card>
            {/* Resolved Reports */}
            <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Resolved Reports</CardTitle>
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-2xl font-bold text-gray-900">
                {stats.resolvedReports ?? 0}
                <CheckCircle className="h-8 w-8 text-blue-600" />
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
                <Bar dataKey="count">
                  <Cell key="Verified" fill={verificationStatusColors['Verified']} />
                  <Cell key="Pending" fill={verificationStatusColors['Pending']} />
                </Bar>
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
                  {userRoleColors.map((color, idx) => (
                    <Cell key={color} fill={color} />
                  ))}
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
                <Bar dataKey="count">
                  {stats.projectStatus.map((item, idx) => (
                    <Cell key={item._id} fill={projectStatusColors[item._id?.toLowerCase()] || '#8884d8'} />
                  ))}
                </Bar>
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
              <RecentActivityFeed />
            </CardContent>
          </Card>

          {/* User Growth & Distribution */}
          <Card className="bg-white rounded-xl shadow-md p-6">
            <CardHeader>
              <CardTitle>User Growth & Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Volunteers', count: stats.userStats.userDistribution.volunteers, growth: 0 },
                  { name: 'Researchers', count: stats.userStats.userDistribution.researchers, growth: 0 },
                  { name: 'Rangers', count: stats.userStats.userDistribution.rangers, growth: 0 },
                  { name: 'Admins', count: stats.userStats.userDistribution.administrators, growth: 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                <Bar dataKey="count" name="Total Users">
                  {userRoleColors.map((color, idx) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default AdminDashboard;
