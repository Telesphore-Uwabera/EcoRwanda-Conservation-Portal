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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api"; // Import your API instance
import {
  Shield,
  AlertTriangle,
  UserCheck,
  Map,
  Radio,
  Clock,
  MapPin,
  Binoculars,
  CheckCircle,
  XCircle,
  Bell,
  TrendingUp,
  Activity,
  Zap,
  FileText,
} from "lucide-react";

// Define interfaces for the data structures
interface RangerStats {
  reportsToVerify: number;
  patrolsCompleted: number;
  threatsDetected: number;
  responseTime: string;
}

interface UrgentAlert {
  id: string;
  type: string;
  location: string;
  reporter: string;
  time: string;
  status: string;
  priority: string;
}

interface PendingReport {
  id: string;
  title: string;
  location: string;
  submittedBy: string;
  submittedAt: string;
  urgency: string;
  evidence: string[];
}

interface PatrolDetail {
  id: string;
  route: string;
  status: string;
  duration: string;
  findings: string;
  ranger: string;
}

export default function RangerDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  // State to hold fetched data
  const [stats, setStats] = useState<RangerStats>({
    reportsToVerify: 0,
    patrolsCompleted: 0,
    threatsDetected: 0,
    responseTime: "N/A",
  });
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [todayPatrols, setTodayPatrols] = useState<PatrolDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API endpoint for ranger dashboard
        const response = await api.get('/ranger/dashboard-data'); 
        const data = response.data;

        setStats(data.stats);
        setUrgentAlerts(data.urgentAlerts);
        setPendingReports(data.pendingReports);
        setTodayPatrols(data.todayPatrols);
      } catch (err) {
        console.error('Error fetching ranger dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Fetch data only if user is logged in
      fetchDashboardData();
    }
  }, [user]); // Re-run when user changes

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800 animate-pulse";
      case "responding":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 font-bold";
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-emerald-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <OfflineIndicator isOnline={isOnline} />

      {/* Urgent Alerts */}
      {urgentAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-red-800 font-medium">
                {urgentAlerts.length} urgent situation(s) require immediate
                attention
              </span>
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                View Alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 🛡️
        </h1>
        <p className="text-gray-600">
          Monitor, verify, and respond to conservation activities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Reports to Verify
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">
                {stats.reportsToVerify.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Patrols Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Binoculars className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-900">
                {stats.patrolsCompleted.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-800">
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-900">
                {stats.threatsDetected.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">
                {stats.responseTime}
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
            Ranger Tools
          </CardTitle>
          <CardDescription>
            Access your ranger and patrol management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-purple-600 hover:bg-purple-700">
              <Link
                to="/ranger/verify-reports"
                className="flex flex-col gap-1"
              >
                <UserCheck className="h-6 w-6" />
                <span>Verify Reports</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Link to="/ranger/patrol-data" className="flex flex-col gap-1">
                <Binoculars className="h-6 w-6" />
                <span>Patrol Data</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Link to="/ranger/threat-map" className="flex flex-col gap-1">
                <Map className="h-6 w-6" />
                <span>Threat Map</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Link to="/ranger/communications" className="flex flex-col gap-1">
                <Radio className="h-6 w-6" />
                <span>Communications</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Pending Reports for Verification
            </CardTitle>
            <CardDescription>
              Reports submitted by volunteers requiring your review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading reports...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : pendingReports.length === 0 ? (
              <p className="text-gray-500">No pending reports found.</p>
            ) : (
              pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-600">
                    Submitted by {report.submittedBy} at {report.submittedAt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${getPriorityColor(report.urgency)}`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {report.urgency}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {report.evidence.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
            {pendingReports.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/ranger/verify-reports">View All Reports</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Today's Patrols */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Binoculars className="h-5 w-5 text-blue-600" />
              Today's Patrols
            </CardTitle>
            <CardDescription>
              Overview of patrol activities for the current day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading patrols...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : todayPatrols.length === 0 ? (
              <p className="text-gray-500">No patrols scheduled for today.</p>
            ) : (
              todayPatrols.map((patrol) => (
                <div
                  key={patrol.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">{patrol.route}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {patrol.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {patrol.findings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Badge className={getStatusColor(patrol.status)}>
                      {patrol.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Ranger: {patrol.ranger}
                    </span>
                  </div>
                </div>
              ))
            )}
            {todayPatrols.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/ranger/patrol-data">View All Patrols</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
