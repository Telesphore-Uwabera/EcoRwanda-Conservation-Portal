import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  Binoculars,
  Search,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Plus,
  Download,
  Play,
  Loader2,
} from "lucide-react";
import api from "@/config/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PatrolDialog } from "@/components/patrol/PatrolDialog";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

interface Ranger {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Patrol {
  id: string;
  route: string;
  status: 'in_progress' | 'scheduled' | 'completed' | 'cancelled';
  actualDuration?: number;
  findings?: string;
  ranger: Ranger;
  patrolDate: string;
  startTime?: string;
  endTime?: string;
  estimatedDuration?: number;
  priority?: 'High' | 'Medium' | 'Low';
  objectives?: string[];
}

export default function PatrolData() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [stats, setStats] = useState({
    totalPatrols: 0,
    patrolsCompleted: 0,
    activePatrols: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [patrolDialogOpen, setPatrolDialogOpen] = useState(false);
  const [patrolDialogMode, setPatrolDialogMode] = useState<"new" | "schedule" | "edit">("new");
  const [selectedPatrol, setSelectedPatrol] = useState<Patrol | null>(null);

  const fetchPatrolData = useCallback(async () => {
    if (!user) return;
      setLoading(true);
    setError(null);
    try {
      const [patrolsRes, statsRes] = await Promise.all([
        api.get('/patrols'),
        api.get('/patrols/stats')
      ]);
      setPatrols(patrolsRes.data.patrols || []);
      setStats(statsRes.data);
      } catch (err) {
      setError('Failed to fetch patrol data. Please try again.');
        console.error('Error fetching patrol data:', err);
      toast.error('Failed to fetch patrol data.');
      } finally {
        setLoading(false);
      }
  }, [user]);

  useEffect(() => {
    fetchPatrolData();
  }, [fetchPatrolData]);

  const filteredPatrols = useMemo(() => patrols.filter((patrol) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      patrol.route.toLowerCase().includes(searchTermLower) ||
      `${patrol.ranger.firstName} ${patrol.ranger.lastName}`.toLowerCase().includes(searchTermLower) ||
      (patrol.findings && patrol.findings.toLowerCase().includes(searchTermLower));
    
    const matchesStatus = statusFilter === "all" || patrol.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const today = new Date();
      const patrolDate = new Date(patrol.patrolDate);
      if (dateFilter === "today") {
        matchesDate = patrolDate.toDateString() === today.toDateString();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        matchesDate = patrolDate >= weekAgo && patrolDate <= today;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  }), [patrols, searchTerm, statusFilter, dateFilter]);

  const recentPatrols = useMemo(() => filteredPatrols
    .filter(patrol => ['completed', 'in_progress', 'cancelled'].includes(patrol.status))
    .sort((a, b) => new Date(b.patrolDate).getTime() - new Date(a.patrolDate).getTime()), [filteredPatrols]);

  const scheduledPatrols = useMemo(() => filteredPatrols
    .filter(patrol => patrol.status === 'scheduled')
    .sort((a, b) => new Date(a.patrolDate).getTime() - new Date(b.patrolDate).getTime()), [filteredPatrols]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed": return { color: "bg-emerald-100 text-emerald-800", text: "Completed" };
      case "in_progress": return { color: "bg-blue-100 text-blue-800", text: "In Progress" };
      case "scheduled": return { color: "bg-amber-100 text-amber-800", text: "Scheduled" };
      case "cancelled": return { color: "bg-red-100 text-red-800", text: "Cancelled" };
      default: return { color: "bg-gray-100 text-gray-800", text: "Unknown" };
    }
  };

  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case "High": return { color: "bg-red-100 text-red-800", text: "High" };
      case "Medium": return { color: "bg-amber-100 text-amber-800", text: "Medium" };
      case "Low": return { color: "bg-emerald-100 text-emerald-800", text: "Low" };
      default: return { color: "bg-gray-100 text-gray-800", text: "N/A" };
    }
  };
  
  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const handlePatrolDialog = (mode: "new" | "schedule" | "edit", patrol?: Patrol) => {
    setPatrolDialogMode(mode);
    setSelectedPatrol(patrol || null);
    setPatrolDialogOpen(true);
  };

  const handlePatrolSuccess = () => {
    fetchPatrolData();
    toast.success(`Patrol ${patrolDialogMode === 'edit' ? 'updated' : patrolDialogMode === 'new' ? 'started' : 'scheduled'} successfully!`);
  };

  const handleDownload = async () => {
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      
      const res = await api.get('/patrols/export', { 
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  
  if (error && !loading) return <div className="p-8"><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <OfflineIndicator isOnline={isOnline} />
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Patrol Operations</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => handlePatrolDialog("new")}>
              <Play className="mr-2 h-4 w-4" /> Start New Patrol
            </Button>
            <Button variant="outline" onClick={() => handlePatrolDialog("schedule")}>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Patrol
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">Manage and view all patrol activities.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patrols" value={stats.totalPatrols} icon={Binoculars} color="text-primary" description="All recorded patrols" />
          <StatCard title="Completed Today" value={stats.completedToday} icon={CheckCircle} color="text-green-500" description="Patrols finished today" />
          <StatCard title="Active Patrols" value={stats.activePatrols} icon={Activity} color="text-blue-500" description="Patrols currently in progress"/>
          <StatCard title="Total Completed" value={stats.patrolsCompleted} icon={TrendingUp} color="text-yellow-500" description="All completed patrols"/>
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Patrols ({recentPatrols.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledPatrols.length})</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-2">
            <Input
                placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto md:w-64"
            />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Date" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
              <Button asChild variant="outline">
                <Link to="/ranger/analytics"><TrendingUp className="mr-2 h-4 w-4" />View Analytics</Link>
              </Button>
        </div>
                  </div>
          <TabsContent value="recent">
             {loading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /></div> : recentPatrols.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentPatrols.map((patrol) => (
                  <Card key={patrol.id} onClick={() => handlePatrolDialog("edit", patrol)} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="font-bold">{patrol.route}</span>
                        <Badge className={getStatusInfo(patrol.status).color}>{getStatusInfo(patrol.status).text}</Badge>
                          </CardTitle>
                      <CardDescription>
                        <Users className="inline-block h-4 w-4 mr-1" /> 
                        {patrol.ranger.firstName} {patrol.ranger.lastName}
                      </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatDate(patrol.patrolDate)} at {patrol.startTime || 'N/A'}</span>
                      </div>
                      {patrol.priority && (
                        <Badge className={getPriorityInfo(patrol.priority).color} variant="outline">{getPriorityInfo(patrol.priority).text}</Badge>
                      )}
                      <p className="text-sm truncate pt-2">{patrol.findings || "No findings recorded yet."}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
            ) : <div className="text-center py-12 text-gray-500">No recent patrols found.</div>}
          </TabsContent>
          <TabsContent value="scheduled">
            {loading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /></div> : scheduledPatrols.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledPatrols.map((patrol) => (
                  <Card key={patrol.id} onClick={() => handlePatrolDialog("edit", patrol)} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="font-bold">{patrol.route}</span>
                        <Badge className={getPriorityInfo(patrol.priority).color} variant="outline">{getPriorityInfo(patrol.priority).text}</Badge>
                          </CardTitle>
                      <CardDescription>Scheduled for: {formatDate(patrol.patrolDate)} at {patrol.startTime}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" /> 
                        Assigned to: {patrol.ranger.firstName} {patrol.ranger.lastName}
                      </div>
                      <p className="text-sm font-semibold pt-2">Objectives:</p>
                      <p className="text-sm line-clamp-2">{patrol.objectives?.join(', ') || 'N/A'}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
            ) : <div className="text-center py-12 text-gray-500">No scheduled patrols found.</div>}
          </TabsContent>
        </Tabs>
      
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
