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
  leadResearcher: { _id: string; firstName: string; lastName: string; email: string };
  location: { lat: number; lng: number; name: string };
  startDate: string;
  endDate: string;
  volunteersNeeded?: number; // Added as optional since it might not always be present or needed for all projects
  createdAt: string;
  updatedAt: string;
  objectives?: string[];
  skillsRequired?: string[];
  applicants?: { _id: string; firstName: string; lastName: string; email: string }[];
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
  objectives?: string[];
  benefits?: string[];
  support?: string[];
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

  // Add state for expanded sections
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [showAllCollab, setShowAllCollab] = useState(false);
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);

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

        // Fetch collaboration requests from the reliable endpoint used on the requests page
        const requestsResponse = await api.get(`/volunteer-requests?requestedBy=${user._id}&populate=applications`);
        if (requestsResponse.data.success) {
            setCollaborationRequests(requestsResponse.data.data);
        }

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

  // Categorize projects by real date logic
  const now = new Date();
  const trulyActiveProjects = activeProjects.filter(project => new Date(project.endDate) >= now);
  const completedProjects = activeProjects.filter(project => new Date(project.endDate) < now);

  // Helper: Get upcoming deadlines (next 2 by endDate)
  const allWithDeadlines = [...activeProjects, ...collaborationRequests].filter(item => new Date(item.endDate) > new Date());
  const upcomingDeadlinesFull = allWithDeadlines.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  const upcomingDeadlines = upcomingDeadlinesFull.slice(0, 5);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading researcher dashboard...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-4">
          <AlertDialog variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertDialog>
        </div>
    );
  }

  return (
      <div>
        <OfflineIndicator isOnline={isOnline} />

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
                  <span>Research Proposals</span>
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
          {/* Row 1: Active Projects | Completed Projects */}
          <div className="flex flex-col h-full">
            {/* Active Projects Card */}
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
              {(!trulyActiveProjects || trulyActiveProjects.length === 0) ? (
                <div className="text-center text-gray-500 py-10">
                  <p>No active projects found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                    {(showAllActive ? trulyActiveProjects : trulyActiveProjects.slice(0, 2)).map((project) => (
                      <div key={project._id} className="p-3 rounded-lg border bg-white">
                        <div className="font-semibold text-gray-800 text-lg">{project.title}</div>
                        <div className="text-sm text-gray-500 space-x-4 mb-1">
                          <span>Location: {project.location?.name || 'TBD'}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{project.description}</div>
                        {project.objectives && project.objectives.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-emerald-700">Objectives:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {project.objectives.map((obj: string, idx: number) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.skillsRequired && project.skillsRequired.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-blue-700">Skills Required:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {project.skillsRequired.map((skill: string, idx: number) => (
                                <li key={idx}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {project.applicants && project.applicants.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-amber-700">Applicants:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {project.applicants.map((app: any, idx: number) => (
                                <li key={idx}>{app.firstName} {app.lastName} ({app.email})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                          <span>Status: <Badge variant="outline">{project.status}</Badge></span>
                          <span>Start: {formatDate(project.startDate)}</span>
                          <span>End: {formatDate(project.endDate)}</span>
                          {project.volunteersNeeded !== undefined && (
                            <span>Volunteers Needed: {project.volunteersNeeded}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">Created: {formatDate(project.createdAt)} | Updated: {formatDate(project.updatedAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {trulyActiveProjects.length > 2 && (
                  <Button
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setShowAllActive((prev) => !prev)}
                  >
                    {showAllActive ? 'Show Less' : 'View More'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col h-full">
            {/* Completed Projects Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-emerald-600" />
                  Completed Projects
                </CardTitle>
                <CardDescription>
                  Your research projects that have ended
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!completedProjects || completedProjects.length === 0) ? (
                  <div className="text-center text-gray-500 py-10">
                    <p>No completed projects found.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {(showAllCompleted ? completedProjects : completedProjects.slice(0, 2)).map((project) => (
                      <div key={project._id} className="p-3 rounded-lg border bg-white">
                        <div className="font-semibold text-gray-800 text-lg">{project.title}</div>
                        <div className="text-sm text-gray-500 space-x-4 mb-1">
                          <span>Location: {project.location?.name || 'TBD'}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{project.description}</div>
                        {project.objectives && project.objectives.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-emerald-700">Objectives:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {project.objectives.map((obj: string, idx: number) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                          <span>Status: <Badge variant="outline">{project.status}</Badge></span>
                          <span>Start: {formatDate(project.startDate)}</span>
                          <span>End: {formatDate(project.endDate)}</span>
                      </div>
                        <div className="text-xs text-gray-400">Created: {formatDate(project.createdAt)} | Updated: {formatDate(project.updatedAt)}</div>
                    </div>
                  ))}
                </div>
                )}
                {completedProjects.length > 2 && (
                  <Button
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setShowAllCompleted((prev) => !prev)}
                  >
                    {showAllCompleted ? 'Show Less' : 'View More'}
                  </Button>
              )}
            </CardContent>
          </Card>
          </div>
          {/* Row 2: Collaboration Requests | Upcoming Deadlines */}
          <div className="flex flex-col h-full">
            {/* Collaboration Requests Card */}
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
                    <p>No active collaboration requests found.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {(showAllCollab ? collaborationRequests : collaborationRequests.slice(0, 2)).map((req: any) => (
                      <div key={req._id} className="p-3 rounded-lg border bg-white">
                        <div className="font-semibold text-gray-800 text-lg">{req.title}</div>
                        <div className="text-sm text-gray-500 space-x-4 mb-1">
                          <span>Requested: {req.requestedBy && (req.requestedBy.firstName || req.requestedBy.lastName) ? `${req.requestedBy.firstName || ''} ${req.requestedBy.lastName || ''}`.trim() : 'N/A'}</span>
                          <span>Location: {req.location?.name || 'TBD'}</span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">{req.description}</div>
                        {req.objectives && req.objectives.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-emerald-700">Objectives:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {req.objectives.map((obj: string, idx: number) => (
                                <li key={idx}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {req.skillsRequired && req.skillsRequired.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-blue-700">Skills Required:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {req.skillsRequired.map((skill: string, idx: number) => (
                                <li key={idx}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {req.applicants && req.applicants.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-amber-700">Applicants:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {req.applicants.map((app: any, idx: number) => (
                                <li key={idx}>{app.firstName} {app.lastName} ({app.email})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {req.benefits && req.benefits.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-green-700">Benefits:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {req.benefits.map((benefit: string, idx: number) => (
                                <li key={idx}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {req.support && req.support.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-xs text-blue-700">Support Provided:</span>
                            <ul className="list-disc list-inside text-xs text-gray-700 ml-2">
                              {req.support.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                          <span>Status: <Badge variant={req.status === 'open' ? 'default' : 'secondary'}>{req.status}</Badge></span>
                          <span>Start: {formatDate(req.startDate)}</span>
                          <span>End: {formatDate(req.endDate)}</span>
                          <span>Volunteers Needed: {req.numberOfVolunteersNeeded}</span>
                          <span>Applicants: {req.applications.length}</span>
                          {req.skillsRequired && req.skillsRequired.length > 0 && (
                            <span>Skills: {req.skillsRequired.join(', ')}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">Created: {formatDate(req.createdAt)} | Updated: {formatDate(req.updatedAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {collaborationRequests.length > 2 && (
                  <Button
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setShowAllCollab((prev) => !prev)}
                  >
                    {showAllCollab ? 'Show Less' : 'View More'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col h-full">
            {/* Upcoming Deadlines Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>
                  Projects and requests ending soon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <p>No upcoming deadlines.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {(showAllDeadlines ? upcomingDeadlinesFull : upcomingDeadlines).map((item, idx) => (
                      <div key={item._id || idx} className="p-3 rounded-lg border bg-white">
                        <div className="font-semibold text-gray-800 text-lg">{item.title}</div>
                        <div className="text-sm text-gray-500 mb-1">
                          <span>Ends: {formatDate(item.endDate)}</span>
                        </div>
                        <div className="text-xs text-gray-700">{item.description}</div>
                    </div>
                  ))}
                </div>
                )}
                {upcomingDeadlinesFull.length > 5 && (
                  <Button
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setShowAllDeadlines((prev) => !prev)}
                  >
                    {showAllDeadlines ? 'Show Less' : 'View More'}
                  </Button>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
  );
}
