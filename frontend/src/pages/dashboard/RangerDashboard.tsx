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
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Plus,
  Calendar,
  Play,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChartContainer } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PatrolDialog } from '@/components/patrol/PatrolDialog';

interface Report {
  _id: string;
  title: string;
  description: string;
  location: { name: string; lat: number; lng: number };
  category: string;
  urgency: string;
  status: string;
  submittedBy: { _id: string; firstName: string; lastName: string; email: string };
  submittedAt: string;
  photos: string[];
  updates: Array<{ note: string; timestamp: string; updatedBy?: { _id: string; firstName: string; lastName: string } }>;
}

// Define interfaces for the data structures
interface RangerStats {
  reportsToVerify: number;
  patrolsCompleted: number;
  threatsDetected: number;
  responseTime: string;
  totalPatrols: number;
  activePatrols: number;
  scheduledPatrols: number;
  completedToday: number;
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
  description: string;
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
  patrolDate: string;
  startTime: string;
  priority: string;
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
    totalPatrols: 0,
    activePatrols: 0,
    scheduledPatrols: 0,
    completedToday: 0,
  });
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [todayPatrols, setTodayPatrols] = useState<PatrolDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patrolsByDay, setPatrolsByDay] = useState<{ _id: string; count: number }[]>([]);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Patrol dialog states
  const [patrolDialogOpen, setPatrolDialogOpen] = useState(false);
  const [patrolDialogMode, setPatrolDialogMode] = useState<"new" | "schedule" | "edit">("new");
  const [selectedPatrol, setSelectedPatrol] = useState<PatrolDetail | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }
      const response = await api.get('/ranger-dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      setStats(data.stats);
      setUrgentAlerts(data.urgentAlerts);
      setPendingReports(data.pendingReports);
      setTodayPatrols(data.todayPatrols);
      setPatrolsByDay(data.patrolsByDay || []);
    } catch (err) {
      console.error('Error fetching ranger dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Set up polling every 30 seconds
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [user]);

  // Manual refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

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

  // Download patrol data as JSON
  const handleDownload = async () => {
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }
      
      const res = await api.get('/patrols/export', { 
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'patrols.json');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Patrol data downloaded!');
    } catch (err) {
      toast.error('Failed to download patrol data');
    }
  };

  // Handle patrol dialog
  const handlePatrolDialog = (mode: "new" | "schedule" | "edit", patrol?: PatrolDetail) => {
    setPatrolDialogMode(mode);
    setSelectedPatrol(patrol || null);
    setPatrolDialogOpen(true);
  };

  const handlePatrolSuccess = () => {
    fetchDashboardData();
    toast.success(patrolDialogMode === "new" ? "Patrol started successfully!" : 
                  patrolDialogMode === "schedule" ? "Patrol scheduled successfully!" : 
                  "Patrol updated successfully!");
  };

  return (
      <div className="space-y-6">
        <OfflineIndicator isOnline={isOnline} />

        {/* Download & Analytics Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 justify-end">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            Download Patrol Data
          </Button>
          <Button asChild variant="outline">
            <Link to="/ranger/analytics">View Analytics</Link>
          </Button>
        </div>

        {/* Patrol Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patrols</CardTitle>
              <Binoculars className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatrols}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patrols</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatrols}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledPatrols}</div>
            </CardContent>
          </Card>
        </div>

        {/* Patrol Management */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" />
            Patrol Management
          </h2>
          <p className="text-gray-600">Start new patrols or schedule future patrols</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => handlePatrolDialog("new")}
              className="h-16 bg-green-600 hover:bg-green-700 flex flex-col gap-1 items-center justify-center"
            >
              <Play className="h-6 w-6" />
              <span>Start New Patrol</span>
            </Button>
            <Button 
              onClick={() => handlePatrolDialog("schedule")}
              variant="outline" 
              className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50 flex flex-col gap-1 items-center justify-center"
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Patrol</span>
            </Button>
            <Button asChild variant="outline" className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Link to="/ranger/patrol-data" className="flex flex-col gap-1 items-center justify-center">
                <Binoculars className="h-6 w-6" />
                <span>View All Patrols</span>
              </Link>
            </Button>
          </div>
        </div>

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

        {/* Ranger Tools */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            Ranger Tools
          </h2>
          <p className="text-gray-600">Access your ranger and patrol management tools</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-indigo-600 hover:bg-indigo-700">
              <Link to="/ranger/verify-reports" className="flex flex-col gap-1 items-center justify-center">
                <UserCheck className="h-6 w-6" />
                <span>Verify Reports</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Link to="/ranger/patrol-data" className="flex flex-col gap-1 items-center justify-center">
                <Binoculars className="h-6 w-6" />
                <span>Patrol Data</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50">
              <Link to="/ranger/threat-map" className="flex flex-col gap-1 items-center justify-center">
                <Map className="h-6 w-6" />
                <span>Threat Map</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 border-purple-300 text-purple-700 hover:bg-purple-50">
              <Link to="/ranger/communications" className="flex flex-col gap-1 items-center justify-center">
                <Radio className="h-6 w-6" />
                <span>Communications</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Pending Reports for Verification */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-600" />
            Pending Reports for Verification
          </h2>
          <p className="text-gray-600">Reports submitted by volunteers requiring your review</p>
          {loading ? (
            <p>Loading pending reports...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : pendingReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4" />
                <p>No pending reports found.</p>
                <p className="text-sm">All clear! You've verified all current submissions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingReports.map((report) => (
                <Card key={report.id} className="h-full min-h-[220px] flex flex-col">
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {report.title}
                        </h3>
                        <Badge className={getPriorityColor(report.urgency)}>
                          {report.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4" /> {report.location == null ? 'Unknown' : (typeof (report.location as any) === 'object' ? (report.location as any).name ?? 'Unknown' : report.location)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button asChild size="sm">
                        <Link to={`/ranger/verify-reports?reportId=${report.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Verify Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Patrol Dialog */}
        <PatrolDialog
          open={patrolDialogOpen}
          onOpenChange={setPatrolDialogOpen}
          mode={patrolDialogMode}
          patrol={selectedPatrol}
          onSuccess={handlePatrolSuccess}
        />
      </div>
  );
}
