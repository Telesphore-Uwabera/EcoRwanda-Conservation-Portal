import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api"; // Import your API instance
import {
  Map,
  AlertTriangle,
  MapPin,
  Clock,
  TrendingUp,
  Filter,
  Layers,
  Zap,
  Shield,
  Camera,
  Navigation,
  Target,
  Activity,
  Radio,
  Users,
} from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface Threat {
  id: string;
  type: string; // Maps to WildlifeReport.category (e.g., 'poaching', 'human_wildlife_conflict')
  severity: string; // Maps to WildlifeReport.urgency (e.g., 'critical', 'high', 'medium', 'low')
  title: string;
  description: string;
  location: { lat: number; lng: number; name: string };
  coordinates: { lat: number; lng: number }; // Redundant if location has lat/lng but kept for compatibility
  reportedAt: string;
  reportedBy: string;
  status: string;
  lastUpdate: string;
}

export default function ThreatMap() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [threatFilter, setThreatFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [activeTab, setActiveTab] = useState("live");
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreats = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }

        const response = await api.get('/threats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Sort threats by reportedAt (most recent first)
        const sortedThreats = response.data.threats.sort((a: Threat, b: Threat) => {
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
        });
        setThreats(sortedThreats);
        setError(null);
      } catch (err) {
        setError('Failed to fetch threat data.');
        console.error('Error fetching threat data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
  }, []);

  // Patrol teams are not directly fetched here, keeping as placeholder for now
  const patrolTeams: any[] = []; 

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTeamStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "responding":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-amber-100 text-amber-800";
      case "standby":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "poaching":
        return "🎯";
      case "habitat_destruction":
        return "🪓";
      case "wildlife_sighting":
        return "🐾";
      case "human_wildlife_conflict":
        return "⚡";
      case "other":
        return "❓";
      default:
        return "⚠️";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredThreats = threats.filter((threat) => {
    const matchesThreat = threatFilter === "all" || threat.type === threatFilter;
    const now = new Date();
    const threatTime = new Date(threat.reportedAt);
    let matchesTime = true;

    if (timeFilter === "24h") {
      matchesTime = (now.getTime() - threatTime.getTime()) < (24 * 60 * 60 * 1000);
    } else if (timeFilter === "7d") {
      matchesTime = (now.getTime() - threatTime.getTime()) < (7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "30d") {
      matchesTime = (now.getTime() - threatTime.getTime()) < (30 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "all") {
      matchesTime = true; // No time filter applied
    }

    return matchesThreat && matchesTime;
  });

  // Calculate stats based on fetched threats
  const activeThreatsCount = filteredThreats.filter(t => t.status !== 'resolved' && t.status !== 'pending').length; 
  const criticalThreatsCount = filteredThreats.filter(t => t.severity === 'critical' && t.status !== 'resolved' && t.status !== 'pending').length;
  const teamsDeployedCount = 0; // Placeholder for now, as we don't have real team data yet
  const avgResponseTime = "N/A"; // Placeholder for now

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading threat map data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <AlertDialog variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertDialog>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Map className="h-8 w-8 text-green-600" />
            Unified Threat Map
          </h1>
          <p className="text-gray-600">
            Real-time threat monitoring and response coordination across all
            protected areas
          </p>
        </div>

        {/* Critical Threat Alert */}
        {criticalThreatsCount > 0 && (
          <Card className="border-l-4 border-red-500 bg-red-50 text-red-800 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="font-semibold">
                {criticalThreatsCount} Critical Threat{criticalThreatsCount > 1 ? "s" : ""} Require Immediate Response
              </p>
            </div>
            <p className="text-sm mt-2">
              Emergency response teams have been notified and are coordinating
              response actions.
            </p>
            <Button className="mt-4 bg-red-600 hover:bg-red-700">
              <Target className="h-4 w-4 mr-2" />
              Coordinate Response
            </Button>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900">
                    {activeThreatsCount}
                  </p>
                  <p className="text-sm text-red-700">Active Threats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-900">
                    {criticalThreatsCount}
                  </p>
                  <p className="text-sm text-orange-700">Critical Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {teamsDeployedCount}
                  </p>
                  <p className="text-sm text-blue-700">Teams Deployed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {avgResponseTime}
                  </p>
                  <p className="text-sm text-emerald-700">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Controls & Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Search threats..."
            className="flex-1 min-w-[200px] md:min-w-[250px] p-2 border rounded-md"
          />
          <Select onValueChange={setThreatFilter} value={threatFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Threat Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threat Types</SelectItem>
              <SelectItem value="poaching">Poaching Activity</SelectItem>
              <SelectItem value="human_wildlife_conflict">
                Human-Wildlife Conflict
              </SelectItem>
              <SelectItem value="habitat_destruction">Habitat Destruction</SelectItem>
              <SelectItem value="wildlife_sighting">Wildlife Sighting</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setTimeFilter} value={timeFilter}>
            <SelectTrigger className="w-[160px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Last 24h" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1"></div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="satellite">Satellite View</TabsTrigger>
              <TabsTrigger value="center">Center Map</TabsTrigger>
              <TabsTrigger value="live">Live Mode</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Interactive Map Placeholder */}
        <Card className="h-[400px] flex items-center justify-center bg-gray-50 border-dashed border-gray-300">
          <CardContent className="text-center text-gray-500 py-10">
            <MapPin className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interactive Threat Map</h3>
            <p className="max-w-md mx-auto">
              Real-time visualization of threats, patrol teams, and response
              activities across Rwanda's protected areas. In a production
              environment, this would integrate with mapping services like
              Mapbox or Google Maps.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                <span className="text-sm text-gray-700">Critical Threats</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                <span className="text-sm text-gray-700">Response Teams</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat List & Team Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threat List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Threat Incidents
              </CardTitle>
              <CardDescription>
                Reported threats and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredThreats.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No threats found for the selected filters.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredThreats.map((threat) => (
                    <Card key={threat.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {getThreatIcon(threat.type)} {threat.title}
                        </CardTitle>
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity.replace("_", " ")}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {threat.location.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="h-4 w-4" /> Reported:
                          {formatDate(threat.reportedAt)} by {threat.reportedBy}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {threat.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge className={getStatusColor(threat.status)}>
                            {threat.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patrol Team Status (Placeholder for now) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Patrol Team Status
              </CardTitle>
              <CardDescription>
                Current status and assignments of active patrol teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patrolTeams.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No active patrol teams found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {patrolTeams.map((team) => (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {team.name}
                        </CardTitle>
                        <Badge className={getTeamStatusColor(team.status)}>
                          {team.status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" /> Leader: {team.leader}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> Location: {team.currentLocation.lat.toFixed(4)}, {team.currentLocation.lng.toFixed(4)}
                        </p>
                        {team.assignedThreat && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" /> Assigned Threat: {threats.find(t => t.id === team.assignedThreat)?.title || 'N/A'}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mt-2">
                          Members: {team.members.join(", ")}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {team.equipment.map((item: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Last Updated: {formatDate(team.lastUpdate)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
