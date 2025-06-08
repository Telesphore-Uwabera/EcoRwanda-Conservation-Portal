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
import { Progress } from "@/components/ui/progress";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api"; // Import your API instance
import {
  Camera,
  MapPin,
  TreePine,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Leaf,
} from "lucide-react";

// Define interfaces for the data structures
interface VolunteerStats {
  reportsSubmitted: number;
  projectsJoined: number;
  impactScore: number;
  rank: string;
}

interface RecentReport {
  id: string;
  title: string;
  status: string;
  location: string;
  submittedAt: string;
  urgency: string;
}

interface AvailableProject {
  id: string;
  title: string;
  description: string;
  status: string;
  location: string;
  startDate: string;
  volunteersNeeded: number;
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  const [stats, setStats] = useState<VolunteerStats>({
    reportsSubmitted: 0,
    projectsJoined: 0,
    impactScore: 0,
    rank: "N/A",
  });
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API endpoint for volunteer dashboard
        const response = await api.get('/volunteer/dashboard-data'); 
        const data = response.data;

        setStats(data.stats);
        setRecentReports(data.recentReports);
        setAvailableProjects(data.availableProjects);
      } catch (err) {
        console.error('Error fetching volunteer dashboard data:', err);
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
      case "verified":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "investigating":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 🌿
        </h1>
        <p className="text-gray-600">
          Continue making a difference in Rwanda's conservation efforts
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Reports Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-900">
                {stats.reportsSubmitted.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Projects Joined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">
                {stats.projectsJoined.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Impact Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">
                {stats.impactScore.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">
              Current Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-900">
                {stats.rank}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Take immediate action to help conservation efforts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              asChild
              className="h-16 bg-emerald-600 hover:bg-emerald-700"
            >
              <Link
                to="/volunteer/submit-report"
                className="flex flex-col gap-1"
              >
                <Camera className="h-6 w-6" />
                <span>Submit Report</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Link to="/volunteer/projects" className="flex flex-col gap-1">
                <TreePine className="h-6 w-6" />
                <span>Join Project</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Link to="/volunteer/my-reports" className="flex flex-col gap-1">
                <MapPin className="h-6 w-6" />
                <span>Track Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-emerald-600" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Your latest wildlife and conservation reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading reports...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : recentReports.length === 0 ? (
              <p className="text-gray-500">No recent reports found.</p>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {report.title}
                      </h4>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
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
                      <span
                        className={`flex items-center gap-1 ${getUrgencyColor(report.urgency)}`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {report.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {recentReports.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/volunteer/my-reports">View All Reports</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Available Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-blue-600" />
              Available Projects
            </CardTitle>
            <CardDescription>
              Explore and join new conservation initiatives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading projects...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : availableProjects.length === 0 ? (
              <p className="text-gray-500">No available projects found.</p>
            ) : (
              availableProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Starts: {project.startDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Join ({project.volunteersNeeded} needed)
                    </Button>
                  </div>
                </div>
              ))
            )}
            {availableProjects.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/volunteer/projects">View All Projects</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
