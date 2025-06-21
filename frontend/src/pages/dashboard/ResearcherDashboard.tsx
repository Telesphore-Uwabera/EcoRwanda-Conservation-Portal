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
  AlertTriangle,
  Map,
} from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Define interfaces for the data structures
interface ResearcherStats {
  publishedFindings: number;
  activeProjects: number;
  volunteerCollaborators: number;
  datasetDownloads: number;
}

interface ResearchProjectData {
  _id: string;
  title: string;
  description: string;
  status: string;
  leadResearcher: { _id: string; firstName: string; lastName: string };
  location: { lat: number; lng: number; name: string };
  startDate: string;
  endDate: string;
  volunteersNeeded?: number; // Added as optional since it might not always be present or needed for all projects
  createdAt: string;
  updatedAt: string;
}

interface ActiveProject extends ResearchProjectData { }

interface RecentPublication extends ResearchProjectData { }

interface CollaborationRequest {
  _id: string;
  researchProject: { _id: string; title: string };
  requestedBy: { _id: string; firstName: string; lastName: string };
  title: string;
  description: string;
  skillsRequired: string[];
  location: { lat: number; lng: number; name: string };
  startDate: string;
  endDate: string;
  numberOfVolunteersNeeded: number;
  applicants: { _id: string; firstName: string; lastName: string }[];
  status: string;
  createdAt: string;
  updatedAt: string;
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

        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }

        const response = await api.get('/researcher-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

    if (user) { 
      fetchDashboardData();
    }
  }, [user]); 

  const getStatusColor = (status: string) => {
    switch (status) {
      case "data_collection":
        return "bg-blue-100 text-blue-800";
      case "analysis":
        return "bg-amber-100 text-amber-800";
      case "planning":
        return "bg-gray-100 text-gray-800";
      case "completed":
      case "published": // Added 'published' status
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading researcher dashboard...</p>
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
        {/* Removed welcome message and description */}

        {/* Quick Stats */}
        {/* Removed quick stats cards */}

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
                <Link to="/researcher/publish" className="flex flex-col gap-1 items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                  <span>Publish Findings</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-16 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Link to="/researcher/data-hub" className="flex flex-col gap-1 items-center justify-center">
                  <Database className="h-6 w-6" />
                  <span>Data Hub</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-16 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Link to="/researcher/request-volunteers" className="flex flex-col gap-1 items-center justify-center">
                  <Users className="h-6 w-6" />
                  <span>Request Help</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-16 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Link to="/researcher/analytics" className="flex flex-col gap-1 items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-16 border-red-300 text-red-700 hover:bg-red-50"
              >
                <Link to="/researcher/threat-map" className="flex flex-col gap-1 items-center justify-center">
                  <Map className="h-6 w-6" />
                  <span>Threat Map</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Research Projects and Publications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-emerald-600" />
                Active Projects
              </CardTitle>
              <CardDescription>
                Your ongoing research initiatives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!activeProjects || activeProjects.length === 0) ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No active projects found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeProjects.map((project) => (
                    <Card key={project._id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {project.title}
                        </CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" /> Lead Researcher: {project.leadResearcher?.firstName} {project.leadResearcher?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> Location: {project.location.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Start Date: {formatDate(project.startDate)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {project.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Volunteers Needed: {project.volunteersNeeded || 0}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Publications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Recent Publications
              </CardTitle>
              <CardDescription>
                Your latest published research findings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(!recentPublications || recentPublications.length === 0) ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No recent publications found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {recentPublications.map((publication) => (
                    <Card key={publication._id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {publication.title}
                        </CardTitle>
                        <Badge className={getStatusColor(publication.status)}>
                          {publication.status.replace("_", " ")}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" /> Lead Researcher: {publication.leadResearcher?.firstName} {publication.leadResearcher?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Published Date: {formatDate(publication.updatedAt)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {publication.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Downloads: 0 {/* Placeholder for actual downloads if we track it in future */}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Citations: 0 {/* Placeholder for actual citations */}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
              {(!collaborationRequests || collaborationRequests.length === 0) ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No collaboration requests found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {collaborationRequests.map((request) => (
                    <Card key={request._id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                          {request.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {request.status.replace("_", " ")}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <BookOpen className="h-4 w-4" /> Project: {request.researchProject?.title}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4" /> Requested by: {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> Location: {request.location.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Dates: {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {request.description}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Volunteers Needed: {request.numberOfVolunteersNeeded}
                          </Badge>
                          {request.skillsRequired && request.skillsRequired.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Skills: {request.skillsRequired.join(", ")}
                            </Badge>
                          )}
                          {request.applicants && (
                            <Badge variant="outline" className="text-xs">
                              Applicants: {request.applicants.length}
                            </Badge>
                          )}
                        </div>
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
