import React, { useState } from "react";
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
} from "lucide-react";

export default function PatrolData() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("recent");

  // TODO: Fetch patrol records from MongoDB backend
  const patrols = [];

  // Mock data for scheduled patrols
  const scheduledPatrols = [
    {
      id: "5",
      route: "Eastern Perimeter Check",
      assignedRanger: "Jean Baptiste Nsengimana",
      partner: "Samuel Nkurunziza",
      scheduledDate: "2024-01-16",
      startTime: "06:00",
      estimatedDuration: "6 hours",
      priority: "high",
      objectives: [
        "Anti-poaching surveillance",
        "Infrastructure check",
        "Wildlife monitoring",
      ],
      equipment: [
        "Radio",
        "GPS",
        "Camera",
        "Binoculars",
        "Evidence collection kit",
      ],
    },
    {
      id: "6",
      route: "Tourist Safety Patrol",
      assignedRanger: "Marie Claire Uwimana",
      partner: "Eric Habimana",
      scheduledDate: "2024-01-16",
      startTime: "08:00",
      estimatedDuration: "4 hours",
      priority: "medium",
      objectives: [
        "Tourist guide assistance",
        "Trail maintenance check",
        "Wildlife photography monitoring",
      ],
      equipment: ["Radio", "GPS", "First Aid Kit", "Emergency beacon"],
    },
  ];

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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPatrols = patrols.filter((patrol) => {
    const matchesSearch =
      patrol.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patrol.ranger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patrol.findings.some((f) =>
        f.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === "all" || patrol.status === statusFilter;
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && patrol.date === "2024-01-15") ||
      (dateFilter === "week" &&
        new Date(patrol.date) >= new Date("2024-01-09"));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    totalPatrols: patrols.length,
    completedToday: patrols.filter(
      (p) => p.date === "2024-01-15" && p.status === "completed",
    ).length,
    activePatrols: patrols.filter((p) => p.status === "in_progress").length,
    incidentsThisWeek: patrols.reduce((sum, p) => sum + p.incidents.length, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
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
                    {stats.incidentsThisWeek}
                  </p>
                  <p className="text-sm text-red-700">Incidents This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Patrol Operations
            </CardTitle>
            <CardDescription>Manage patrol schedules and data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-16 bg-blue-600 hover:bg-blue-700 flex flex-col gap-1">
                <Plus className="h-6 w-6" />
                <span>Start New Patrol</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex flex-col gap-1"
              >
                <Calendar className="h-6 w-6" />
                <span>Schedule Patrol</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50 flex flex-col gap-1"
              >
                <Download className="h-6 w-6" />
                <span>Export Data</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 border-purple-300 text-purple-700 hover:bg-purple-50 flex flex-col gap-1"
              >
                <TrendingUp className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search patrols by route, ranger, or findings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">
              Recent Patrols ({filteredPatrols.length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled ({scheduledPatrols.length})
            </TabsTrigger>
          </TabsList>

          {/* Recent Patrols Tab */}
          <TabsContent value="recent" className="space-y-4">
            {filteredPatrols.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Binoculars className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No patrols found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search filters or start a new patrol.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPatrols.map((patrol) => (
                  <Card
                    key={patrol.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patrol.route}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Led by {patrol.ranger}
                              {patrol.partner &&
                                ` • Partner: ${patrol.partner}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(patrol.status)}>
                              {patrol.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        {/* Patrol Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(patrol.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {patrol.startTime} - {patrol.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Route className="h-3 w-3" />
                            {patrol.distance} • {patrol.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {patrol.photos} photos
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Checkpoint Progress</span>
                            <span>
                              {patrol.checkpointsVisited}/{patrol.checkpoints}{" "}
                              completed
                            </span>
                          </div>
                          <Progress
                            value={
                              (patrol.checkpointsVisited / patrol.checkpoints) *
                              100
                            }
                            className="h-2"
                          />
                        </div>

                        {/* Findings */}
                        {patrol.findings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">
                              Key Findings:
                            </h4>
                            <ul className="space-y-1">
                              {patrol.findings.map((finding, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-gray-700 flex items-start gap-2"
                                >
                                  <span className="text-emerald-600">•</span>
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Incidents */}
                        {patrol.incidents.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">
                              Incidents:
                            </h4>
                            <div className="space-y-2">
                              {patrol.incidents.map((incident, index) => (
                                <div
                                  key={index}
                                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium text-red-900">
                                        {incident.type.replace("_", " ")}
                                      </p>
                                      <p className="text-sm text-red-700">
                                        {incident.description}
                                      </p>
                                    </div>
                                    <div className="text-right text-sm">
                                      <span
                                        className={`font-medium ${getSeverityColor(incident.severity)}`}
                                      >
                                        {incident.severity}
                                      </span>
                                      <p className="text-gray-600">
                                        {incident.time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Equipment & Weather */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              Equipment Used:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {patrol.equipment.map((item, index) => (
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
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              Weather Conditions:
                            </h4>
                            <p className="text-sm text-gray-700">
                              {patrol.weather}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download GPS Track
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            View Photos
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            View Full Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Scheduled Patrols Tab */}
          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPatrols.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No scheduled patrols
                  </h3>
                  <p className="text-gray-600">
                    Schedule new patrols to manage your field operations.
                  </p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Patrol
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {scheduledPatrols.map((patrol) => (
                  <Card
                    key={patrol.id}
                    className="border-l-4 border-l-amber-500"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {patrol.route}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Assigned: {patrol.assignedRanger}
                              {patrol.partner &&
                                ` • Partner: ${patrol.partner}`}
                            </p>
                          </div>
                          <Badge className={getPriorityColor(patrol.priority)}>
                            {patrol.priority} priority
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(patrol.scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {patrol.startTime} ({patrol.estimatedDuration})
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {patrol.partner ? "2 rangers" : "1 ranger"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Objectives:
                          </h4>
                          <ul className="space-y-1">
                            {patrol.objectives.map((objective, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-700 flex items-start gap-2"
                              >
                                <span className="text-blue-600">•</span>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Required Equipment:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {patrol.equipment.map((item, index) => (
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

                        <div className="flex gap-2">
                          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            Start Patrol
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Edit Schedule
                          </Button>
                          <Button variant="ghost" className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
