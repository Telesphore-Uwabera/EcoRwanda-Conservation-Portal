import React, { useState, useEffect, useMemo } from "react";
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
import { Link } from "react-router-dom";

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
  };
  patrolDate: string;
  createdAt: string;
  updatedAt?: string;
  incidents?: any[];
  startTime?: string;
  endTime?: string;
  assignedRanger?: string;
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
  const [editPatrol, setEditPatrol] = useState<Patrol | null>(null);

    const fetchPatrols = async () => {
      setLoading(true);
    setError(null);
    try {
        const response = await api.get('/patrols', {
          headers: {
          Authorization: `Bearer ${user?.token}`,
          },
        });
        setPatrols(response.data.patrols || []);
      } catch (err) {
        setError('Failed to fetch patrol data.');
        console.error('Error fetching patrol data:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user?.token) {
      fetchPatrols();
    }
  }, [user?.token]);

  const patrolStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalPatrols: patrols.length,
      completedToday: patrols.filter(p => p.status === 'completed' && new Date(p.patrolDate).toDateString() === today.toDateString()).length,
      activePatrols: patrols.filter(p => p.status === 'in_progress').length,
      completedPatrols: patrols.filter(p => p.status === 'completed').length,
    };
  }, [patrols]);

  const filteredPatrols = useMemo(() => patrols.filter((patrol) => {
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
        patrolDate >= new Date(new Date().setDate(today.getDate() - 7)));

    return matchesSearch && matchesStatus && matchesDate;
  }), [patrols, searchTerm, statusFilter, dateFilter]);

  const recentPatrols = useMemo(() => filteredPatrols.filter(patrol =>
    ['completed', 'in_progress'].includes(patrol.status)
  ).sort((a, b) => new Date(b.patrolDate).getTime() - new Date(a.patrolDate).getTime()), [filteredPatrols]);

  const scheduledPatrols = useMemo(() => filteredPatrols.filter(patrol =>
    patrol.status === 'scheduled'
  ).sort((a, b) => new Date(a.patrolDate).getTime() - new Date(b.patrolDate).getTime()), [filteredPatrols]);

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

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const handleEditPatrol = (patrol) => {
    setEditPatrol(patrol);
    if(patrol.status === 'scheduled') {
        setShowScheduleDialog(true);
    } else {
        setShowNewPatrolDialog(true);
    }
  }

  const handleDialogClose = () => {
    setEditPatrol(null);
    setShowNewPatrolDialog(false);
    setShowScheduleDialog(false);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <p className="text-lg">Loading patrol data...</p>
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
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <OfflineIndicator isOnline={isOnline} />
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Patrol Operations</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => { setEditPatrol(null); setShowNewPatrolDialog(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Start New Patrol
            </Button>
            <Button variant="outline" onClick={() => { setEditPatrol(null); setShowScheduleDialog(true); }}>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Patrol
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Manage patrol activities and data
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patrols" value={patrolStats.totalPatrols} icon={Binoculars} color="text-primary" description="All recorded patrols" />
          <StatCard title="Completed Today" value={patrolStats.completedToday} icon={CheckCircle} color="text-green-500" description="Patrols finished today" />
          <StatCard title="Active Patrols" value={patrolStats.activePatrols} icon={Activity} color="text-blue-500" description="Patrols currently in progress"/>
          <StatCard title="Completed Patrols" value={patrolStats.completedPatrols} icon={TrendingUp} color="text-yellow-500" description="Total patrols completed"/>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent Patrols</TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled {scheduledPatrols.length > 0 && `(${scheduledPatrols.length})`}
            </TabsTrigger>
          </TabsList>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
            <Input
              placeholder="Search patrols by route, ranger, or findings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
            />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline"><Link to="/ranger/analytics"><TrendingUp className="mr-2 h-4 w-4" /> View Analytics</Link></Button>
                  </div>
                  </div>
          <TabsContent value="recent">
            {recentPatrols.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentPatrols.map((patrol) => (
                  <Card key={patrol._id} onClick={() => handleEditPatrol(patrol)} className="cursor-pointer hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {patrol.route}
                        <Badge className={getStatusColor(patrol.status)}>{patrol.status.replace('_', ' ')}</Badge>
                          </CardTitle>
                      <CardDescription>
                        <Users className="inline-block h-4 w-4 mr-1" /> 
                        {patrol.ranger.firstName} {patrol.ranger.lastName}
                      </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatDate(patrol.patrolDate)}</span>
                      </div>
                      <p className="text-sm truncate">{patrol.findings || "No findings recorded yet."}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
            ) : <p>No recent patrols found.</p>}
          </TabsContent>
          <TabsContent value="scheduled">
             {scheduledPatrols.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledPatrols.map((patrol) => (
                  <Card key={patrol._id} onClick={() => handleEditPatrol(patrol)} className="cursor-pointer hover:shadow-md">
              <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                          {patrol.route}
                          <Badge className={getPriorityColor(patrol.priority)}>{patrol.priority}</Badge>
                          </CardTitle>
                      <CardDescription>Scheduled for: {formatDate(patrol.patrolDate)} at {patrol.startTime}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" /> 
                        <span>Assigned to: {patrol.ranger.firstName} {patrol.ranger.lastName}</span>
                      </div>
                      <p className="text-sm">Objectives: {patrol.objectives?.join(', ') || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
             ) : <p>No scheduled patrols found.</p>}
          </TabsContent>
        </Tabs>
      </div>
      
      {(showNewPatrolDialog || showScheduleDialog) && (
      <PatrolDialog
          isOpen={showNewPatrolDialog || showScheduleDialog}
          onClose={handleDialogClose}
          onPatrolSaved={fetchPatrols}
        patrol={editPatrol}
          isScheduling={showScheduleDialog}
      />
      )}
    </DashboardLayout>
  );
}
