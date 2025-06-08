import React, { useState } from "react";
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
} from "lucide-react";

export default function ThreatMap() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [threatFilter, setThreatFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [activeTab, setActiveTab] = useState("live");

  // Mock data for threat locations
  const threats = [
    {
      id: "1",
      type: "poaching_activity",
      severity: "critical",
      title: "Active Poaching Site",
      description: "Multiple snares discovered, fresh human activity signs",
      location: "Sector A-7, Volcanoes NP",
      coordinates: { lat: -1.4617, lng: 29.5264 },
      reportedAt: "2024-01-15T14:30:00Z",
      reportedBy: "Emmanuel Habimana",
      status: "active",
      responseTeam: "Team Alpha",
      estimatedThreatLevel: 95,
      evidence: ["Photos", "GPS coordinates", "Physical evidence"],
      lastUpdate: "2024-01-15T16:00:00Z",
    },
    {
      id: "2",
      type: "human_wildlife_conflict",
      severity: "high",
      title: "Elephant Crop Damage",
      description:
        "Elephants breaking into agricultural areas near park boundary",
      location: "Nyabihu District Border",
      coordinates: { lat: -1.3833, lng: 29.4167 },
      reportedAt: "2024-01-15T09:15:00Z",
      reportedBy: "Local Farmer via Community Leader",
      status: "responding",
      responseTeam: "Team Beta",
      estimatedThreatLevel: 75,
      evidence: ["Damage photos", "Community reports"],
      lastUpdate: "2024-01-15T12:30:00Z",
    },
    {
      id: "3",
      type: "illegal_logging",
      severity: "high",
      title: "Unauthorized Tree Cutting",
      description: "Chainsaw activity detected in protected forest area",
      location: "Nyungwe Forest, Remote Sector",
      coordinates: { lat: -2.4817, lng: 29.2073 },
      reportedAt: "2024-01-14T16:45:00Z",
      reportedBy: "Acoustic Monitoring System",
      status: "investigating",
      responseTeam: "Team Gamma",
      estimatedThreatLevel: 80,
      evidence: ["Audio recordings", "Satellite imagery"],
      lastUpdate: "2024-01-15T08:00:00Z",
    },
    {
      id: "4",
      type: "suspicious_vehicle",
      severity: "medium",
      title: "Unidentified Vehicle",
      description:
        "Vehicle observed multiple times near park perimeter during night hours",
      location: "Akagera NP Eastern Gate",
      coordinates: { lat: -1.8833, lng: 30.7333 },
      reportedAt: "2024-01-13T22:30:00Z",
      reportedBy: "Gate Security",
      status: "monitoring",
      responseTeam: null,
      estimatedThreatLevel: 45,
      evidence: ["Vehicle photos", "License plate (partial)"],
      lastUpdate: "2024-01-14T06:00:00Z",
    },
    {
      id: "5",
      type: "fire_risk",
      severity: "medium",
      title: "Illegal Campfire",
      description: "Unauthorized campfire in high-risk fire zone",
      location: "Gishwati Forest",
      coordinates: { lat: -1.7, lng: 29.5 },
      reportedAt: "2024-01-13T18:20:00Z",
      reportedBy: "Patrol Team",
      status: "resolved",
      responseTeam: "Local Rangers",
      estimatedThreatLevel: 30,
      evidence: ["Site photos", "Fire remains analysis"],
      lastUpdate: "2024-01-13T20:00:00Z",
    },
  ];

  // Mock data for patrol teams
  const patrolTeams = [
    {
      id: "alpha",
      name: "Team Alpha",
      leader: "Jean Baptiste Nsengimana",
      members: ["Emmanuel Habimana", "Samuel Nkurunziza"],
      status: "active",
      currentLocation: { lat: -1.4617, lng: 29.5264 },
      assignedThreat: "1",
      equipment: ["Radio", "GPS", "Camera", "Evidence kit"],
      lastUpdate: "2024-01-15T16:00:00Z",
    },
    {
      id: "beta",
      name: "Team Beta",
      leader: "Marie Claire Uwimana",
      members: ["Vincent Mukamana", "Grace Mukashema"],
      status: "responding",
      currentLocation: { lat: -1.3833, lng: 29.4167 },
      assignedThreat: "2",
      equipment: ["Radio", "GPS", "Tranquilizer equipment", "Barriers"],
      lastUpdate: "2024-01-15T12:30:00Z",
    },
    {
      id: "gamma",
      name: "Team Gamma",
      leader: "Eric Habimana",
      members: ["Samuel Mucyo"],
      status: "investigating",
      currentLocation: { lat: -2.4817, lng: 29.2073 },
      assignedThreat: "3",
      equipment: ["Radio", "GPS", "Camera", "Chainsaw evidence kit"],
      lastUpdate: "2024-01-15T08:00:00Z",
    },
  ];

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
      case "responding":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-amber-100 text-amber-800";
      case "monitoring":
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
      case "poaching_activity":
        return "🎯";
      case "human_wildlife_conflict":
        return "⚡";
      case "illegal_logging":
        return "🪓";
      case "suspicious_vehicle":
        return "🚗";
      case "fire_risk":
        return "🔥";
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
    const matchesThreat =
      threatFilter === "all" || threat.type === threatFilter;
    const now = new Date();
    const threatTime = new Date(threat.reportedAt);
    const timeDiff = now.getTime() - threatTime.getTime();

    let matchesTime = true;
    if (timeFilter === "24h") {
      matchesTime = timeDiff <= 24 * 60 * 60 * 1000;
    } else if (timeFilter === "48h") {
      matchesTime = timeDiff <= 48 * 60 * 60 * 1000;
    } else if (timeFilter === "7d") {
      matchesTime = timeDiff <= 7 * 24 * 60 * 60 * 1000;
    }

    return matchesThreat && matchesTime;
  });

  const stats = {
    activeThreatCount: threats.filter((t) => t.status === "active").length,
    criticalThreatCount: threats.filter((t) => t.severity === "critical")
      .length,
    activeTeamCount: patrolTeams.filter(
      (t) => t.status === "active" || t.status === "responding",
    ).length,
    responseTime: "15 min",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Map className="h-8 w-8 text-red-600" />
            Unified Threat Map
          </h1>
          <p className="text-gray-600">
            Real-time threat monitoring and response coordination across all
            protected areas
          </p>
        </div>

        {/* Critical Alert Banner */}
        {stats.criticalThreatCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  {stats.criticalThreatCount} Critical Threat
                  {stats.criticalThreatCount > 1 ? "s" : ""} Require Immediate
                  Response
                </h3>
                <p className="text-red-700">
                  Emergency response teams have been notified and are
                  coordinating response actions.
                </p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">
                <Radio className="h-4 w-4 mr-2" />
                Coordinate Response
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900">
                    {stats.activeThreatCount}
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
                    {stats.criticalThreatCount}
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
                    {stats.activeTeamCount}
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
                    {stats.responseTime}
                  </p>
                  <p className="text-sm text-emerald-700">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Map Controls & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={threatFilter} onValueChange={setThreatFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Threat Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Threat Types</SelectItem>
                  <SelectItem value="poaching_activity">
                    Poaching Activity
                  </SelectItem>
                  <SelectItem value="human_wildlife_conflict">
                    Human-Wildlife Conflict
                  </SelectItem>
                  <SelectItem value="illegal_logging">
                    Illegal Logging
                  </SelectItem>
                  <SelectItem value="suspicious_vehicle">
                    Suspicious Vehicle
                  </SelectItem>
                  <SelectItem value="fire_risk">Fire Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="48h">Last 48h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Satellite View
                </Button>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Center Map
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Activity className="h-4 w-4 mr-2" />
                  Live Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="h-96">
          <CardContent className="p-0 h-full">
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-blue-100 to-amber-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Interactive Threat Map
                </h3>
                <p className="text-gray-600 max-w-md">
                  Real-time visualization of threats, patrol teams, and response
                  activities across Rwanda's protected areas. In a production
                  environment, this would integrate with mapping services like
                  Mapbox or Google Maps.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="text-sm font-medium">
                        Critical Threats
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      High priority incidents
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      <span className="text-sm font-medium">
                        Response Teams
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Active patrol units</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat Details */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">
              Live Threats ({filteredThreats.length})
            </TabsTrigger>
            <TabsTrigger value="teams">
              Response Teams ({patrolTeams.length})
            </TabsTrigger>
          </TabsList>

          {/* Live Threats Tab */}
          <TabsContent value="live" className="space-y-4">
            {filteredThreats.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No active threats
                  </h3>
                  <p className="text-gray-600">
                    All clear in the selected time range and threat categories.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredThreats.map((threat) => (
                  <Card
                    key={threat.id}
                    className={`border-l-4 ${
                      threat.severity === "critical"
                        ? "border-l-red-500"
                        : threat.severity === "high"
                          ? "border-l-orange-500"
                          : threat.severity === "medium"
                            ? "border-l-amber-500"
                            : "border-l-emerald-500"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">
                              {getThreatIcon(threat.type)}
                            </span>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-gray-900">
                                {threat.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Reported by {threat.reportedBy}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`border ${getSeverityColor(threat.severity)}`}
                            >
                              {threat.severity}
                            </Badge>
                            <Badge className={getStatusColor(threat.status)}>
                              {threat.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700">
                          {threat.description}
                        </p>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {threat.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(threat.reportedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {threat.estimatedThreatLevel}% threat level
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {threat.responseTeam || "No team assigned"}
                          </span>
                        </div>

                        {/* Evidence */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">
                            Available Evidence:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {threat.evidence.map((evidence, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {evidence}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Last Update */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Last Update:</span>{" "}
                            {formatDate(threat.lastUpdate)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-red-600 hover:bg-red-700">
                            <Radio className="h-4 w-4 mr-2" />
                            Dispatch Team
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Navigation className="h-4 w-4 mr-2" />
                            View on Map
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Camera className="h-4 w-4 mr-2" />
                            View Evidence
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Response Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="space-y-4">
              {patrolTeams.map((team) => (
                <Card
                  key={team.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900">
                            {team.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Led by {team.leader}
                          </p>
                        </div>
                        <Badge className={getTeamStatusColor(team.status)}>
                          {team.status}
                        </Badge>
                      </div>

                      {/* Team Members */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">
                          Team Members:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {member}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Current Assignment */}
                      {team.assignedThreat && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">
                            Current Assignment:
                          </h4>
                          <p className="text-sm text-blue-700">
                            Threat ID: {team.assignedThreat} -{" "}
                            {
                              threats.find((t) => t.id === team.assignedThreat)
                                ?.title
                            }
                          </p>
                        </div>
                      )}

                      {/* Equipment */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">
                          Equipment:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {team.equipment.map((item, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Location & Last Update */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          Coordinates: {team.currentLocation.lat.toFixed(
                            4,
                          )}, {team.currentLocation.lng.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last Update: {formatDate(team.lastUpdate)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Radio className="h-4 w-4 mr-2" />
                          Contact Team
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Navigation className="h-4 w-4 mr-2" />
                          Track Location
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Target className="h-4 w-4 mr-2" />
                          Assign Threat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
