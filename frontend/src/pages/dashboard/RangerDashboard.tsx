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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

export default function RangerDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  const stats = {
    reportsToVerify: 8,
    patrolsCompleted: 24,
    threatsDetected: 3,
    responseTime: "15 min",
  };

  const urgentAlerts = [
    {
      id: "1",
      type: "poaching",
      location: "Sector A-7, Volcanoes NP",
      reporter: "Local Volunteer",
      time: "2 hours ago",
      status: "active",
      priority: "critical",
    },
    {
      id: "2",
      type: "human_wildlife_conflict",
      location: "Nyabihu District Border",
      reporter: "Community Leader",
      time: "4 hours ago",
      status: "responding",
      priority: "high",
    },
  ];

  const pendingReports = [
    {
      id: "1",
      title: "Illegal fishing nets found",
      location: "Lake Ihema, Akagera NP",
      submittedBy: "Tourist Guide",
      submittedAt: "2024-01-15 14:30",
      urgency: "medium",
      evidence: ["photos", "gps"],
    },
    {
      id: "2",
      title: "Elephant crop damage",
      location: "Musanze District",
      submittedBy: "Local Farmer",
      submittedAt: "2024-01-15 09:15",
      urgency: "high",
      evidence: ["photos", "video"],
    },
    {
      id: "3",
      title: "Suspicious campfire remains",
      location: "Nyungwe Forest",
      submittedBy: "Park Volunteer",
      submittedAt: "2024-01-14 16:45",
      urgency: "low",
      evidence: ["photos"],
    },
  ];

  const todayPatrols = [
    {
      id: "1",
      route: "Northern Boundary",
      status: "completed",
      duration: "4.5 hours",
      findings: "Normal wildlife activity",
      ranger: "You",
    },
    {
      id: "2",
      route: "Tourist Trail Alpha",
      status: "in_progress",
      duration: "2 hours",
      findings: "Ongoing...",
      ranger: "Jean Baptiste",
    },
    {
      id: "3",
      route: "Remote Sector B",
      status: "scheduled",
      duration: "3 hours",
      findings: "Not started",
      ranger: "Marie Claire",
    },
  ];

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
          Ranger Operations Center 🛡️
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
                {stats.reportsToVerify}
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
                {stats.patrolsCompleted}
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
                {stats.threatsDetected}
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
            <Shield className="h-5 w-5 text-amber-600" />
            Ranger Operations
          </CardTitle>
          <CardDescription>Access your field operation tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-amber-600 hover:bg-amber-700">
              <Link to="/ranger/verify-reports" className="flex flex-col gap-1">
                <UserCheck className="h-6 w-6" />
                <span>Verify Reports</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Link to="/ranger/patrol-data" className="flex flex-col gap-1">
                <Binoculars className="h-6 w-6" />
                <span>Patrol Data</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-red-300 text-red-700 hover:bg-red-50"
            >
              <Link to="/ranger/threat-map" className="flex flex-col gap-1">
                <Map className="h-6 w-6" />
                <span>Threat Map</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Link to="/ranger/communication" className="flex flex-col gap-1">
                <Radio className="h-6 w-6" />
                <span>Communications</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Report Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600" />
              Reports Awaiting Verification
            </CardTitle>
            <CardDescription>
              Review and verify volunteer reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-lg border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {report.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        by {report.submittedBy}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(report.urgency)}>
                      {report.urgency}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {report.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {report.submittedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.evidence.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <XCircle className="h-4 w-4 mr-1" />
                      Request More Info
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/ranger/verify-reports">View All Pending Reports</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's Patrol Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Binoculars className="h-5 w-5 text-blue-600" />
              Today's Patrol Schedule
            </CardTitle>
            <CardDescription>
              Monitor field operations and patrol routes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayPatrols.map((patrol) => (
              <div key={patrol.id} className="p-4 rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {patrol.route}
                    </h4>
                    <Badge className={getStatusColor(patrol.status)}>
                      {patrol.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <span>Duration: {patrol.duration}</span>
                    <span>Ranger: {patrol.ranger}</span>
                  </div>

                  <p className="text-sm text-gray-700">{patrol.findings}</p>

                  {patrol.status === "scheduled" && (
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Start Patrol
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/ranger/patrol-data">View All Patrols</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts Detail */}
      {urgentAlerts.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Bell className="h-5 w-5" />
              Urgent Alerts Requiring Immediate Action
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg bg-red-50 border border-red-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">
                        {alert.type.replace("_", " ").toUpperCase()}
                      </h4>
                      <p className="text-sm text-red-700">
                        Reported by {alert.reporter}
                      </p>
                    </div>
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-red-700">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </span>
                    <span
                      className={`flex items-center gap-1 ${getPriorityColor(alert.priority)}`}
                    >
                      <Zap className="h-3 w-3" />
                      {alert.priority}
                    </span>
                  </div>

                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Radio className="h-4 w-4 mr-2" />
                    Coordinate Response
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
