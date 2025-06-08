import React from "react";
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
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  const systemStats = {
    totalUsers: 2847,
    activeUsers: 1923,
    pendingVerifications: 34,
    systemUptime: "99.9%",
  };

  const userMetrics = {
    volunteers: { count: 2156, growth: 12.5 },
    researchers: { count: 167, growth: 8.3 },
    rangers: { count: 89, growth: 4.2 },
    administrators: { count: 12, growth: 0 },
  };

  const recentActivities = [
    {
      id: "1",
      type: "user_registration",
      description: "New volunteer registered from Musanze",
      user: "Marie Uwimana",
      timestamp: "5 minutes ago",
      status: "pending_verification",
    },
    {
      id: "2",
      type: "report_submitted",
      description: "Wildlife incident report submitted",
      user: "Jean Baptiste (Ranger)",
      timestamp: "15 minutes ago",
      status: "verified",
    },
    {
      id: "3",
      type: "research_published",
      description: "New research findings published",
      user: "Dr. Aline Mukamana",
      timestamp: "1 hour ago",
      status: "approved",
    },
    {
      id: "4",
      type: "system_alert",
      description: "High data sync volume detected",
      user: "System",
      timestamp: "2 hours ago",
      status: "resolved",
    },
  ];

  const systemAlerts = [
    {
      id: "1",
      type: "performance",
      title: "Database performance degradation",
      description: "Query response times increased by 15%",
      severity: "medium",
      time: "30 minutes ago",
    },
    {
      id: "2",
      type: "security",
      title: "Multiple failed login attempts",
      description: "Unusual login pattern detected from IP range",
      severity: "high",
      time: "1 hour ago",
    },
  ];

  const pendingVerifications = [
    {
      id: "1",
      name: "Samuel Nkurunziza",
      role: "researcher",
      organization: "University of Rwanda",
      location: "Kigali",
      registeredAt: "2024-01-15",
      documents: ["ID", "Academic credentials"],
    },
    {
      id: "2",
      name: "Grace Mukashema",
      role: "volunteer",
      organization: "Local Conservation Group",
      location: "Nyanza",
      registeredAt: "2024-01-15",
      documents: ["ID"],
    },
    {
      id: "3",
      name: "Eric Habimana",
      role: "ranger",
      organization: "Rwanda Development Board",
      location: "Volcanoes NP",
      registeredAt: "2024-01-14",
      documents: ["ID", "Employment verification"],
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "report_submitted":
        return <FileText className="h-4 w-4 text-emerald-600" />;
      case "research_published":
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case "system_alert":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-emerald-100 text-emerald-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "pending_verification":
        return "bg-amber-100 text-amber-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50 text-red-800";
      case "medium":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "low":
        return "border-blue-200 bg-blue-50 text-blue-800";
      default:
        return "border-gray-200 bg-gray-50 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "volunteer":
        return "bg-emerald-100 text-emerald-800";
      case "researcher":
        return "bg-blue-100 text-blue-800";
      case "ranger":
        return "bg-amber-100 text-amber-800";
      case "administrator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <OfflineIndicator isOnline={isOnline} />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          System Administration 🏛️
        </h1>
        <p className="text-gray-600">
          Monitor and manage the EcoRwanda conservation platform
        </p>
      </div>

      {/* System Health Stats */}
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
                {systemStats.totalUsers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-900">
                {systemStats.activeUsers.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">
                {systemStats.pendingVerifications}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">
                {systemStats.systemUptime}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Administration Tools
          </CardTitle>
          <CardDescription>
            Manage users, system settings, and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-purple-600 hover:bg-purple-700">
              <Link to="/admin/users" className="flex flex-col gap-1">
                <Users className="h-6 w-6" />
                <span>User Management</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Link to="/admin/analytics" className="flex flex-col gap-1">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Link to="/admin/settings" className="flex flex-col gap-1">
                <Settings className="h-6 w-6" />
                <span>System Settings</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Link to="/admin/database" className="flex flex-col gap-1">
                <Database className="h-6 w-6" />
                <span>Database</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            User Role Distribution
          </CardTitle>
          <CardDescription>
            Growth and distribution across user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(userMetrics).map(([role, metrics]) => (
              <div key={role} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {role}
                  </span>
                  <Badge className={getRoleColor(role)}>
                    {metrics.count.toLocaleString()}
                  </Badge>
                </div>
                <Progress value={75} className="h-2" />
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">
                    +{metrics.growth}% this month
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent System Activity
            </CardTitle>
            <CardDescription>
              Latest platform activities and events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">by {activity.user}</p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Activity Log
            </Button>
          </CardContent>
        </Card>

        {/* User Verification Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              Pending User Verifications
            </CardTitle>
            <CardDescription>
              Users awaiting account verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingVerifications.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-lg border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {user.registeredAt}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{user.organization}</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {user.documents.map((doc) => (
                      <Badge key={doc} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/users?filter=pending">View All Pending</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Critical system notifications requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge
                      variant="outline"
                      className={
                        alert.severity === "high"
                          ? "border-red-300"
                          : "border-amber-300"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-75">{alert.time}</span>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
