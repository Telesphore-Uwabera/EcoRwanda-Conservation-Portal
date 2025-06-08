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
  BookOpen,
  Database,
  Users,
  BarChart3,
  FileText,
  MapPin,
  Calendar,
  Download,
  TrendingUp,
  Award,
  Microscope,
  Globe,
  Clock,
} from "lucide-react";

// Define interfaces for the data structures
interface ResearcherStats {
  publishedFindings: number;
  activeProjects: number;
  volunteerCollaborators: number;
  datasetDownloads: number;
}

interface ActiveProject {
  id: string;
  title: string;
  description: string;
  status: string;
  location: string;
  startDate: string;
  volunteersNeeded: number;
}

interface RecentPublication {
  id: string;
  title: string;
  journal: string;
  date: string;
  downloads: number;
  citations: number;
}

interface CollaborationRequest {
  id: string;
  title: string;
  requiredSkills: string[];
  volunteers: number;
  target: number;
  deadline: string;
}

export default function ResearcherDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  // State to hold fetched data
  const [stats, setStats] = useState<ResearcherStats>({
    publishedFindings: 0,
    activeProjects: 0,
    volunteerCollaborators: 0,
    datasetDownloads: 0,
  });
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [recentPublications, setRecentPublications] = useState<RecentPublication[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Replace with actual API endpoint for researcher dashboard
        const response = await api.get('/researcher/dashboard-data'); 
        const data = response.data;

        setStats(data.stats);
        setActiveProjects(data.activeProjects);
        setRecentPublications(data.recentPublications);
        setCollaborationRequests(data.collaborationRequests);
      } catch (err) {
        console.error('Error fetching researcher dashboard data:', err);
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
      case "data_collection":
        return "bg-blue-100 text-blue-800";
      case "analysis":
        return "bg-amber-100 text-amber-800";
      case "planning":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
          Welcome back, {user?.firstName}! 🔬
        </h1>
        <p className="text-gray-600">
          Advance scientific understanding of Rwanda's ecosystems
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Published Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">
                {stats.publishedFindings.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-900">
                {stats.activeProjects.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">
                {stats.volunteerCollaborators.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">
              Dataset Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">
                {stats.datasetDownloads.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Research Tools
          </CardTitle>
          <CardDescription>
            Access your research and collaboration tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-blue-600 hover:bg-blue-700">
              <Link to="/researcher/publish" className="flex flex-col gap-1">
                <BookOpen className="h-6 w-6" />
                <span>Publish Findings</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Link to="/researcher/data-hub" className="flex flex-col gap-1">
                <Database className="h-6 w-6" />
                <span>Data Hub</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Link
                to="/researcher/request-volunteers"
                className="flex flex-col gap-1"
              >
                <Users className="h-6 w-6" />
                <span>Request Help</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Link to="/researcher/analytics" className="flex flex-col gap-1">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Research Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-blue-600" />
              Active Projects
            </CardTitle>
            <CardDescription>Your ongoing research initiatives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading projects...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : activeProjects.length === 0 ? (
              <p className="text-gray-500">No active projects found.</p>
            ) : (
              activeProjects.map((project) => (
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
                      View Project ({project.volunteersNeeded} needed)
                    </Button>
                  </div>
                </div>
              ))
            )}
            {activeProjects.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/researcher/projects">View All Projects</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Publications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Recent Publications
            </CardTitle>
            <CardDescription>
              Your latest published research findings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading publications...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : recentPublications.length === 0 ? (
              <p className="text-gray-500">No recent publications found.</p>
            ) : (
              recentPublications.map((publication) => (
                <div
                  key={publication.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">
                    {publication.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {publication.journal} - {publication.date}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {publication.downloads.toLocaleString()} Downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {publication.citations.toLocaleString()} Citations
                    </span>
                  </div>
                </div>
              ))
            )}
            {recentPublications.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/researcher/findings">View All Findings</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Collaboration Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Collaboration Requests
            </CardTitle>
            <CardDescription>
              Requests for volunteer assistance in your research
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading requests...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : collaborationRequests.length === 0 ? (
              <p className="text-gray-500">No collaboration requests found.</p>
            ) : (
              collaborationRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">{request.title}</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {request.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {request.volunteers}/{request.target} volunteers
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {request.deadline}
                    </span>
                  </div>
                  <Button size="sm" className="mt-3 w-full">
                    View Details
                  </Button>
                </div>
              ))
            )}
            {collaborationRequests.length > 0 && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/researcher/requests">View All Requests</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
