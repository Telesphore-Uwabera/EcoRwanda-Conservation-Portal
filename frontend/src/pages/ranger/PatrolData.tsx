import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  Binoculars,
  Search,
  Calendar,
  MapPin,
  Clock,
  Route,
  Users,
  Camera,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Plus,
  Download,
  Filter,
  MessageSquare,
} from "lucide-react";
import api from "@/config/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PatrolDialog } from "@/components/patrol/PatrolDialog";

interface Patrol {
  _id: string;
  route: string;
  status: 'in_progress' | 'scheduled' | 'completed' | 'cancelled';
  duration?: string;
  findings?: string;
  ranger: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }; // Assuming ranger is populated with basic user info
  patrolDate: string; // Date string from backend
  createdAt: string;
  updatedAt: string;
  incidents?: any[]; // To be defined more specifically later if needed
  // For scheduled patrols
  startTime?: string;
  endTime?: string;
  assignedRanger?: string; // Could be populated from ranger object or separate field
  partner?: string;
  estimatedDuration?: string;
  priority?: 'high' | 'medium' | 'low';
  objectives?: string[];
  equipment?: string[];
}

export default function PatrolData() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("recent");
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPatrolDialog, setShowNewPatrolDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [stats, setStats] = useState({
    totalPatrols: 0,
    completedToday: 0,
    activePatrols: 0,
    patrolsCompleted: 0,
  });

  useEffect(() => {
    const fetchPatrols = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }

        const response = await api.get('/patrols', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatrols(response.data.patrols || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patrol data.');
        console.error('Error fetching patrol data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatrols();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/patrols/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching patrol stats:', err);
      }
    };
    fetchStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPatrols = patrols.filter((patrol) => {
    const matchesSearch =
      patrol.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patrol.ranger?.firstName && patrol.ranger.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patrol.ranger?.lastName && patrol.ranger.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patrol.findings && patrol.findings.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || patrol.status === statusFilter;
    
    const patrolDate = new Date(patrol.patrolDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && patrolDate.toDateString() === today.toDateString()) ||
      (dateFilter === "week" &&
        patrolDate >= new Date(today.setDate(today.getDate() - 7))); // Check if within the last 7 days

    return matchesSearch && matchesStatus && matchesDate;
  });

  const recentPatrols = filteredPatrols.filter(patrol =>
    ['completed', 'in_progress'].includes(patrol.status) &&
    new Date(patrol.patrolDate) >= new Date(new Date().setDate(new Date().getDate() - 30))
  ).sort((a, b) => new Date(b.patrolDate).getTime() - new Date(a.patrolDate).getTime());

  const scheduledPatrols = filteredPatrols.filter(patrol =>
    patrol.status === 'scheduled' && new Date(patrol.patrolDate) >= new Date()
  ).sort((a, b) => new Date(a.patrolDate).getTime() - new Date(b.patrolDate).getTime());

  const handleExport = async () => {
    try {
      const response = await api.get('/patrols/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'patrols.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting patrols:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading patrol data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Binoculars className="h-8 w-8 text-blue-600" />
            Patrol Data Management
          </h1>
          <p className="text-gray-600">
            Monitor patrol activities, track routes, and manage field operations
            data
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Route className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.totalPatrols}
                  </p>
                  <p className="text-sm text-blue-700">Total Patrols</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {stats.completedToday}
                  </p>
                  <p className="text-sm text-emerald-700">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {stats.activePatrols}
                  </p>
                  <p className="text-sm text-amber-700">Active Patrols</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900">
                    {stats.patrolsCompleted}
                  </p>
                  <p className="text-sm text-red-700">Completed Patrols</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patrol Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Binoculars className="h-5 w-5 text-blue-600" />
              Patrol Operations
            </CardTitle>
            <CardDescription>
              Manage patrol schedules and data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                className="h-16 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowNewPatrolDialog(true)}
              >
                <Plus className="h-5 w-5" />
                Start New Patrol
              </Button>
              <Button 
                variant="outline" 
                className="h-16"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Calendar className="h-5 w-5" />
                Schedule Patrol
              </Button>
              <Button variant="outline" className="h-16" onClick={handleExport}>
                <Download className="h-5 w-5" />
                Export Data
              </Button>
              <Button variant="outline" className="h-16">
                <TrendingUp className="h-5 w-5" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patrols by route, ranger, or findings..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Patrols ({recentPatrols.length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledPatrols.length})</TabsTrigger>
          </TabsList>

          {/* Recent Patrols Tab */}
          <TabsContent value="recent" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patrols</CardTitle>
                <CardDescription>Overview of recently completed or in-progress patrol activities.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-10">
                    <p>Loading recent patrols...</p>
                  </div>
                ) : error ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                ) : recentPatrols.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Binoculars className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>No recent patrols found.</p>
                    <p className="text-sm">
                      Start a new patrol or adjust filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recentPatrols.map((patrol) => (
                      <Card key={patrol._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            Patrol {patrol.route}
                          </CardTitle>
                          <Badge className={getStatusColor(patrol.status)}>
                            {patrol.status.replace("_", " ")}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="h-4 w-4" /> Ranger: {patrol.ranger?.firstName} {patrol.ranger?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Date: {formatDate(patrol.patrolDate)}
                          </p>
                          {patrol.duration && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-4 w-4" /> Duration: {patrol.duration}
                            </p>
                          )}
                          {patrol.findings && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              Findings: {patrol.findings}
                            </p>
                          )}
                          {patrol.incidents && patrol.incidents.length > 0 && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" /> Incidents: {patrol.incidents.length}
                            </p>
                          )}
                          <Button size="sm" className="mt-3">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Patrols Tab */}
          <TabsContent value="scheduled" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Patrols</CardTitle>
                <CardDescription>Upcoming patrol activities and their details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-10">
                    <p>Loading scheduled patrols...</p>
                  </div>
                ) : error ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                ) : scheduledPatrols.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>No scheduled patrols found.</p>
                    <p className="text-sm">
                      Schedule a new patrol to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {scheduledPatrols.map((patrol) => (
                      <Card key={patrol._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            Patrol {patrol.route}
                          </CardTitle>
                          <Badge className={getStatusColor(patrol.status)}>
                            {patrol.status.replace("_", " ")}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="h-4 w-4" /> Ranger: {patrol.ranger?.firstName} {patrol.ranger?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> Date: {formatDate(patrol.patrolDate)}
                          </p>
                          {patrol.startTime && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-4 w-4" /> Start Time: {patrol.startTime}
                            </p>
                          )}
                          {patrol.estimatedDuration && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-4 w-4" /> Est. Duration: {patrol.estimatedDuration}
                            </p>
                          )}
                          {patrol.objectives && patrol.objectives.length > 0 && (
                            <p className="text-sm text-gray-700 mt-2">
                              Objectives: {patrol.objectives.join(", ")}
                            </p>
                          )}
                          {patrol.equipment && patrol.equipment.length > 0 && (
                            <p className="text-sm text-gray-700 mt-2">
                              Equipment: {patrol.equipment.join(", ")}
                            </p>
                          )}
                          {patrol.priority && (
                            <Badge variant="outline" className={getPriorityColor(patrol.priority)}>
                              Priority: {patrol.priority}
                            </Badge>
                          )}
                          <Button size="sm" className="mt-3">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <PatrolDialog
        open={showNewPatrolDialog}
        onOpenChange={setShowNewPatrolDialog}
        mode="new"
      />
      <PatrolDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        mode="schedule"
      />
    </DashboardLayout>
  );
}
