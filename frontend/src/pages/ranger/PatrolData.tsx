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
import { addHours, isAfter, isBefore, parseISO, differenceInHours } from 'date-fns';

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
  priority?: 'high' | 'medium' | 'low';
  objectives?: string[];
  equipment?: string[];
  notes?: string;
  createdAt?: string;
  attendees?: { name: string; phone: string }[];
}

// Helper to calculate patrol status
const calculatePatrolStatus = (patrol) => {
  if (!patrol || !patrol.patrolDate) return 'unknown';
  if (patrol.status === 'cancelled') return 'cancelled';
  let start;
  try {
    start = new Date(patrol.patrolDate + 'T' + (patrol.startTime || '00:00'));
    if (isNaN(start.getTime())) return 'unknown';
  } catch {
    return 'unknown';
  }
  const end = patrol.estimatedDuration ? addHours(start, patrol.estimatedDuration) : null;
  const now = new Date();
  if (isBefore(now, start)) return 'scheduled';
  if (end && isAfter(now, end)) return 'completed';
  if (end && isAfter(now, start) && isBefore(now, end)) return 'in_progress';
  return patrol.status || 'scheduled';
};

// Helper to calculate time until scheduled patrol
const getTimeUntilPatrol = (patrolDate: string, startTime: string) => {
  try {
    const patrolDateTime = new Date(patrolDate + 'T' + startTime);
    const now = new Date();
    const diffMs = patrolDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours}h ${diffMinutes}m`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  } catch {
    return null;
  }
};

// Helper to render attendees
const renderAttendees = (attendees?: { name: string; phone: string }[]) => {
  if (!attendees || attendees.length === 0) return null;
  return (
    <div className="pt-2">
      <p className="text-sm font-semibold">Attendees:</p>
      <ul className="pl-4 list-disc text-sm">
        {attendees.map((a, i) => (
          <li key={i}>{a.name} ({a.phone})</li>
        ))}
      </ul>
    </div>
  );
};

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

  const [uncancellingId, setUncancellingId] = useState<string | null>(null);

  const [allPatrols, setAllPatrols] = useState<Patrol[]>([]);
  const [loadingAllPatrols, setLoadingAllPatrols] = useState(true);
  const [timeUpdate, setTimeUpdate] = useState(0); // For forcing re-renders of time displays

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

  // Update time displays every minute for scheduled patrols
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const applyFilters = (patrols: Patrol[]) => {
    return patrols.filter((patrol) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        patrol.route.toLowerCase().includes(searchTermLower) ||
        `${patrol.ranger.firstName} ${patrol.ranger.lastName}`.toLowerCase().includes(searchTermLower) ||
        (patrol.findings && patrol.findings.toLowerCase().includes(searchTermLower));
      const status = calculatePatrolStatus(patrol);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const today = new Date();
        const patrolDate = new Date(patrol.patrolDate);
        if (dateFilter === 'today') {
          matchesDate = patrolDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = patrolDate >= weekAgo && patrolDate <= today;
        }
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredPatrols = useMemo(() => applyFilters(patrols), [patrols, searchTerm, statusFilter, dateFilter, timeUpdate]);

  // Group filtered patrols by status
  const groupedFilteredPatrols = useMemo(() => {
    const groups = { scheduled: [], in_progress: [], completed: [], cancelled: [], recent: [] };
    filteredPatrols.forEach((patrol) => {
      const status = calculatePatrolStatus(patrol);
      groups[status].push({ ...patrol, status });
      if (status === 'in_progress' && isAfter(new Date(), new Date(patrol.patrolDate + 'T' + (patrol.startTime || '00:00')))) {
        groups.recent.push({ ...patrol, status });
      }
    });
    return groups;
  }, [filteredPatrols, timeUpdate]);

  // Fix recent patrols logic: patrols created within the last 24 hours
  const now = new Date();
  const recentPatrols = patrols.filter((patrol) => {
    if (!patrol.createdAt) return false;
    const created = new Date(patrol.createdAt);
    return now.getTime() - created.getTime() <= 24 * 60 * 60 * 1000;
  });

  // Scheduled patrols: all future scheduled patrols
  const scheduledPatrols = patrols.filter((patrol) => {
    const start = new Date(patrol.patrolDate + 'T' + (patrol.startTime || '00:00'));
    return start > now && patrol.status === 'scheduled';
  });

  // Cancelled patrols: status 'cancelled'
  const cancelledPatrols = patrols.filter((patrol) => patrol.status === 'cancelled');

  // Use applyFilters(recentPatrols) for filteredRecentPatrols
  const filteredRecentPatrols = applyFilters(recentPatrols);

  // Use filtered lists for all patrol sections
  const filteredScheduledPatrols = applyFilters(scheduledPatrols);
  const filteredCancelledPatrols = applyFilters(cancelledPatrols);
  const filteredActivePatrolsAll = applyFilters(allPatrols.filter(p => calculatePatrolStatus(p) === 'in_progress'));
  const filteredCompletedPatrolsAll = applyFilters(allPatrols.filter(p => calculatePatrolStatus(p) === 'completed'));

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
  
  const handleCancelPatrol = async (patrolId: string) => {
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const response = await api.patch(`/patrols/${patrolId}/status`, { status: 'cancelled' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        await fetchPatrolData();
        await fetchAllPatrols();
        toast.success('Patrol cancelled successfully');
      } else {
        throw new Error(response.data.message || 'Failed to cancel patrol');
      }
    } catch (err: any) {
      console.error('Cancel error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel patrol';
      toast.error(msg);
    }
  };

  const handleUncancelPatrol = async (patrolId: string) => {
    setUncancellingId(patrolId);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const response = await api.patch(`/patrols/${patrolId}/status`, { status: 'scheduled' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        await fetchPatrolData();
        await fetchAllPatrols();
        toast.success('Patrol reactivated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to reactivate patrol');
      }
    } catch (err: any) {
      console.error('Uncancel error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to reactivate patrol';
      toast.error(msg);
    } finally {
      setUncancellingId(null);
    }
  };

  const totalCompleted = patrols.filter(p => calculatePatrolStatus(p) === 'completed').length;
  const activePatrols = patrols.filter(p => calculatePatrolStatus(p) === 'in_progress').length;

  // Fetch all patrols for Active Patrols section
  const fetchAllPatrols = useCallback(async () => {
    setLoadingAllPatrols(true);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        token = JSON.parse(storedUser).token;
      }
      const res = await api.get('/patrols/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllPatrols(res.data.patrols || []);
    } catch (err) {
      console.error('Error fetching all patrols:', err);
    } finally {
      setLoadingAllPatrols(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPatrols();
  }, [fetchAllPatrols]);

  // Active patrols (all rangers)
  const activePatrolsAll = useMemo(() => allPatrols.filter(p => calculatePatrolStatus(p) === 'in_progress'), [allPatrols]);

  // Completed patrols (all rangers)
  const completedPatrolsAll = useMemo(() => allPatrols.filter(p => calculatePatrolStatus(p) === 'completed'), [allPatrols]);

  const handleEditPatrol = (e: React.MouseEvent, patrol: any) => {
    e.stopPropagation(); // Prevent card click event
    handlePatrolDialog('edit', patrol);
  };

  const handleCancelPatrolClick = (e: React.MouseEvent, patrolId: string) => {
    e.stopPropagation(); // Prevent card click event
    handleCancelPatrol(patrolId);
  };

  const handleUncancelPatrolClick = (e: React.MouseEvent, patrolId: string) => {
    e.stopPropagation(); // Prevent card click event
    handleUncancelPatrol(patrolId);
  };

  if (error && !loading) return <div className="p-8"><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <OfflineIndicator isOnline={isOnline} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Patrol Operations</h2>
            <p className="text-muted-foreground">Manage and view all patrol activities.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:items-center">
            <Button onClick={() => handlePatrolDialog("new")}> <Play className="mr-2 h-4 w-4" /> Start New Patrol </Button>
            <Button variant="outline" onClick={() => handlePatrolDialog("schedule")}> <Calendar className="mr-2 h-4 w-4" /> Schedule Patrol </Button>
            <Button variant="outline" onClick={handleDownload}> <Download className="mr-2 h-4 w-4" /> Export Data </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patrols" value={stats.totalPatrols} icon={Binoculars} color="text-primary" description="All recorded patrols" />
          <StatCard title="Completed Today" value={stats.completedToday} icon={CheckCircle} color="text-green-500" description="Patrols finished today" />
          <StatCard title="Active Patrols" value={activePatrols} icon={Activity} color="text-blue-500" description="Patrols currently in progress"/>
          <StatCard title="Total Completed" value={totalCompleted} icon={TrendingUp} color="text-yellow-500" description="All completed patrols"/>
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Patrols ({filteredRecentPatrols.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({filteredScheduledPatrols.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({filteredCancelledPatrols.length})</TabsTrigger>
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
             {loading ? (
               <div className="text-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" />
               </div>
             ) : filteredRecentPatrols.length > 0 ? (
               <>
                 <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                   {filteredRecentPatrols.slice(0, 4).map((patrol) => (
                     <Card key={patrol.id} className="min-w-[260px] max-w-full p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
                       <CardHeader>
                         <CardTitle className="flex justify-between items-start">
                           <span className="font-bold">{patrol.route}</span>
                           <Badge className={getStatusInfo(calculatePatrolStatus(patrol)).color}>
                             {getStatusInfo(calculatePatrolStatus(patrol)).text}
                           </Badge>
                         </CardTitle>
                         <CardDescription>
                           <div className="flex items-center text-sm text-muted-foreground">
                             <Calendar className="mr-2 h-4 w-4" />
                             <span>{formatDate(patrol.patrolDate)} at {patrol.startTime || ''}</span>
                           </div>
                           {patrol.startTime && calculatePatrolStatus(patrol) === 'scheduled' && (
                             <div className="flex items-center text-sm text-blue-600 font-medium mt-1">
                               <Clock className="mr-2 h-4 w-4" />
                               <span>
                                 {(() => {
                                   const timeUntil = getTimeUntilPatrol(patrol.patrolDate, patrol.startTime);
                                   return timeUntil ? `Starts in ${timeUntil}` : null;
                                 })()}
                               </span>
                             </div>
                           )}
                           <div className="flex items-center text-sm text-muted-foreground">
                             <Clock className="mr-2 h-4 w-4" />
                             <span>Estimated Duration: {patrol.estimatedDuration ? `${patrol.estimatedDuration}h` : 'N/A'}</span>
                             {patrol.actualDuration !== undefined && patrol.actualDuration !== null && (
                               <span className="ml-4">Actual Duration: {patrol.actualDuration}h</span>
                             )}
                           </div>
                           {patrol.endTime && (
                             <div className="flex items-center text-sm text-muted-foreground">
                               <Clock className="mr-2 h-4 w-4" />
                               <span>End Time: {typeof patrol.endTime === 'string' ? formatDate(patrol.endTime) : ''}</span>
                             </div>
                           )}
                         </CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-2">
                         <div className="flex items-center text-sm text-muted-foreground">
                           <Users className="mr-2 h-4 w-4" />
                           Assigned to: {patrol.ranger.firstName} {patrol.ranger.lastName}
                         </div>
                         {patrol.objectives && patrol.objectives.length > 0 && (
                           <>
                             <p className="text-sm font-semibold pt-2">Objectives:</p>
                             <p className="text-sm line-clamp-2">{patrol.objectives.join(', ')}</p>
                           </>
                         )}
                         {patrol.equipment && patrol.equipment.length > 0 && (
                           <>
                             <p className="text-sm font-semibold pt-2">Equipment:</p>
                             <p className="text-sm line-clamp-2">{patrol.equipment.join(', ')}</p>
                           </>
                         )}
                         {patrol.notes && (
                           <>
                             <p className="text-sm font-semibold pt-2">Notes:</p>
                             <p className="text-sm line-clamp-2">{patrol.notes}</p>
                           </>
                         )}
                         {patrol.findings && (
                           <>
                             <p className="text-sm font-semibold pt-2">Findings:</p>
                             <p className="text-sm line-clamp-2">{patrol.findings}</p>
                           </>
                         )}
                         {renderAttendees(patrol.attendees)}
                         <div className="flex gap-2 pt-2">
                           {(user?._id === patrol.ranger._id || user?.role === 'admin') && calculatePatrolStatus(patrol) !== 'completed' && (
                             <Button size="sm" variant="outline" onClick={(e) => handleEditPatrol(e, patrol)}>
                               Edit
                             </Button>
                           )}
                           {(user?._id === patrol.ranger._id || user?.role === 'admin') && calculatePatrolStatus(patrol) !== 'completed' && (
                             calculatePatrolStatus(patrol) === 'cancelled' ? (
                               <Button size="sm" variant="default" onClick={(e) => handleUncancelPatrolClick(e, patrol.id)} disabled={uncancellingId === patrol.id}>
                                 {uncancellingId === patrol.id ? 'Uncancelling...' : 'Uncancel'}
                               </Button>
                             ) : (
                               <Button size="sm" variant="destructive" onClick={(e) => handleCancelPatrolClick(e, patrol.id)}>
                                 Cancel
                               </Button>
                             )
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
                 {filteredRecentPatrols.length > 4 && (
                   <div className="flex justify-end mt-4">
                     <Button asChild variant="outline">
                       <Link to="/ranger/patrols?tab=recent">View All</Link>
                     </Button>
                   </div>
                 )}
               </>
             ) : <div className="text-center py-12 text-gray-500">No recent patrols found.</div>}
          </TabsContent>
          <TabsContent value="scheduled">
            {loading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /></div> :
              filteredScheduledPatrols.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredScheduledPatrols.slice(0, 4).map((patrol) => (
                      <Card key={patrol.id} onClick={() => handlePatrolDialog("edit", patrol)} className="min-w-[260px] max-w-full p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            <span className="font-bold">{patrol.route}</span>
                            <Badge className={getStatusInfo(patrol.status).color}>{getStatusInfo(patrol.status).text}</Badge>
                          </CardTitle>
                          <CardDescription>
                            Scheduled for: {formatDate(patrol.patrolDate)} at {patrol.startTime}
                            {patrol.startTime && (
                              <div className="mt-1 text-sm text-blue-600 font-medium">
                                {(() => {
                                  const timeUntil = getTimeUntilPatrol(patrol.patrolDate, patrol.startTime);
                                  return timeUntil ? `Starts in ${timeUntil}` : null;
                                })()}
                              </div>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-2 h-4 w-4" /> 
                            Assigned to: {patrol.ranger.firstName} {patrol.ranger.lastName}
                          </div>
                          {patrol.objectives && patrol.objectives.length > 0 && (
                            <>
                              <p className="text-sm font-semibold pt-2">Objectives:</p>
                              <p className="text-sm line-clamp-2">{patrol.objectives.join(', ')}</p>
                            </>
                          )}
                          {renderAttendees(patrol.attendees)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredScheduledPatrols.length > 4 && (
                    <div className="flex justify-end mt-4">
                      <Button asChild variant="outline">
                        <Link to="/ranger/patrols?tab=scheduled">View All</Link>
                      </Button>
                    </div>
                  )}
                </>
              ) : <div className="text-center py-12 text-gray-500">No scheduled patrols found.</div>}
          </TabsContent>
          <TabsContent value="cancelled">
            {loading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" /></div> :
              filteredCancelledPatrols.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCancelledPatrols.slice(0, 4).map((patrol) => (
                      <Card key={patrol.id} onClick={() => handlePatrolDialog("edit", patrol)} className="min-w-[260px] max-w-full p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            <span className="font-bold">{patrol.route}</span>
                            <Badge className={getStatusInfo(patrol.status).color}>{getStatusInfo(patrol.status).text}</Badge>
                          </CardTitle>
                          <CardDescription>Cancelled on: {formatDate(patrol.patrolDate)} at {patrol.startTime}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-2 h-4 w-4" />
                            Assigned to: {patrol.ranger.firstName} {patrol.ranger.lastName}
                          </div>
                          {patrol.objectives && patrol.objectives.length > 0 && (
                            <>
                              <p className="text-sm font-semibold pt-2">Objectives:</p>
                              <p className="text-sm line-clamp-2">{patrol.objectives.join(', ')}</p>
                            </>
                          )}
                          {renderAttendees(patrol.attendees)}
                          <div className="flex gap-2 pt-2">
                            {(user?._id === patrol.ranger._id || user?.role === 'admin') && (
                              <>
                                <Button size="sm" variant="outline" onClick={(e) => handleEditPatrol(e, patrol)}>Edit</Button>
                                {calculatePatrolStatus(patrol) === 'cancelled' ? (
                                  <Button size="sm" variant="default" onClick={(e) => handleUncancelPatrolClick(e, patrol.id)} disabled={uncancellingId === patrol.id}>
                                    {uncancellingId === patrol.id ? 'Uncancelling...' : 'Uncancel'}
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="destructive" onClick={(e) => handleCancelPatrolClick(e, patrol.id)}>
                                    Cancel
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredCancelledPatrols.length > 4 && (
                    <div className="flex justify-end mt-4">
                      <Button asChild variant="outline">
                        <Link to="/ranger/patrols?tab=cancelled">View All</Link>
                      </Button>
                    </div>
                  )}
                </>
              ) : <div className="text-center py-12 text-gray-500">No cancelled patrols found.</div>}
          </TabsContent>
        </Tabs>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Active Patrols (All Rangers)</h3>
        {loadingAllPatrols ? (
          <div>Loading active patrols...</div>
        ) : activePatrolsAll.length === 0 ? (
          <div>No active patrols found.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activePatrolsAll.map((patrol) => (
              <Card key={patrol.id} className="min-w-[260px] max-w-full p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
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
                <CardContent className="flex flex-col flex-1 justify-between space-y-2">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{formatDate(patrol.patrolDate)} at {patrol.startTime || ''}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Estimated Duration: {patrol.estimatedDuration ? `${patrol.estimatedDuration}h` : 'N/A'}</span>
                      {patrol.actualDuration !== undefined && patrol.actualDuration !== null && (
                        <span className="ml-4">Actual Duration: {patrol.actualDuration}h</span>
                      )}
                    </div>
                    {patrol.endTime && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>End Time: {typeof patrol.endTime === 'string' ? formatDate(patrol.endTime) : ''}</span>
                      </div>
                    )}
                    {patrol.objectives && patrol.objectives.length > 0 && (
                      <>
                        <p className="text-sm font-semibold pt-2">Objectives:</p>
                        <p className="text-sm line-clamp-2">{patrol.objectives.join(', ')}</p>
                      </>
                    )}
                    {patrol.equipment && patrol.equipment.length > 0 && (
                      <>
                        <p className="text-sm font-semibold pt-2">Equipment:</p>
                        <p className="text-sm line-clamp-2">{patrol.equipment.join(', ')}</p>
                      </>
                    )}
                    {patrol.notes && (
                      <>
                        <p className="text-sm font-semibold pt-2">Notes:</p>
                        <p className="text-sm line-clamp-2">{patrol.notes}</p>
                      </>
                    )}
                    {patrol.findings && (
                      <>
                        <p className="text-sm font-semibold pt-2">Findings:</p>
                        <p className="text-sm line-clamp-2">{patrol.findings}</p>
                      </>
                    )}
                    {renderAttendees(patrol.attendees)}
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    {(user?._id === patrol.ranger._id || user?.role === 'admin') && calculatePatrolStatus(patrol) !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => handlePatrolDialog('edit', patrol)}>Edit</Button>
                    )}
                    {(user?._id === patrol.ranger._id || user?.role === 'admin') && calculatePatrolStatus(patrol) !== 'completed' && (
                      calculatePatrolStatus(patrol) === 'cancelled' ? (
                        <Button size="sm" variant="default" onClick={() => handleUncancelPatrol(patrol.id)} disabled={uncancellingId === patrol.id}>
                          {uncancellingId === patrol.id ? 'Uncancelling...' : 'Uncancel'}
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleCancelPatrol(patrol.id)}>
                          Cancel
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Completed Patrols Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Completed Patrols (All Rangers)</h3>
        {loadingAllPatrols ? (
          <div>Loading completed patrols...</div>
        ) : completedPatrolsAll.length === 0 ? (
          <div>No completed patrols found.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {completedPatrolsAll.map((patrol) => (
              <Card key={patrol.id} className="min-w-[260px] max-w-full p-4 flex flex-col justify-between hover:shadow-lg transition-shadow">
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
                <CardContent className="flex flex-col flex-1 justify-between space-y-2">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{formatDate(patrol.patrolDate)} at {patrol.startTime || ''}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Estimated Duration: {patrol.estimatedDuration ? `${patrol.estimatedDuration}h` : 'N/A'}</span>
                      {patrol.actualDuration !== undefined && patrol.actualDuration !== null && (
                        <span className="ml-4">Actual Duration: {patrol.actualDuration}h</span>
                      )}
                    </div>
                    {patrol.endTime && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>End Time: {typeof patrol.endTime === 'string' ? formatDate(patrol.endTime) : ''}</span>
                      </div>
                    )}
                    {patrol.objectives && patrol.objectives.length > 0 && (
                      <>
                        <p className="text-sm font-semibold pt-2">Objectives:</p>
                        <p className="text-sm line-clamp-2">{patrol.objectives.join(', ')}</p>
                      </>
                    )}
                    {patrol.equipment && patrol.equipment.length > 0 && (
                      <>
                        <p className="text-sm font-semibold pt-2">Equipment:</p>
                        <p className="text-sm line-clamp-2">{patrol.equipment.join(', ')}</p>
                      </>
                    )}
                    {patrol.notes && (
                      <>
                        <p className="text-sm font-semibold pt-2">Notes:</p>
                        <p className="text-sm line-clamp-2">{patrol.notes}</p>
                      </>
                    )}
                    {patrol.findings && (
                      <>
                        <p className="text-sm font-semibold pt-2">Findings:</p>
                        <p className="text-sm line-clamp-2">{patrol.findings}</p>
                      </>
                    )}
                    {renderAttendees(patrol.attendees)}
                  </div>
                  <div className="flex gap-2 pt-2 mt-auto">
                    {(user?._id === patrol.ranger._id || user?.role === 'admin') && calculatePatrolStatus(patrol) !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => handlePatrolDialog('edit', patrol)}>Edit</Button>
                    )}
                    {(user?._id === patrol.ranger._id || user?.role === 'admin') && calculatePatrolStatus(patrol) !== 'completed' && (
                      calculatePatrolStatus(patrol) === 'cancelled' ? (
                        <Button size="sm" variant="default" onClick={() => handleUncancelPatrol(patrol.id)} disabled={uncancellingId === patrol.id}>
                          {uncancellingId === patrol.id ? 'Uncancelling...' : 'Uncancel'}
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleCancelPatrol(patrol.id)}>
                          Cancel
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
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
