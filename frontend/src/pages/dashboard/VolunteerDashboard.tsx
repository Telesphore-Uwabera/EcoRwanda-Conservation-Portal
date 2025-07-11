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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { format } from 'date-fns';

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

interface WildlifeReport {
  _id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  photos: string[];
  category: string;
  urgency: string;
  status: string;
  submittedAt: string;
}

interface AvailableProject {
  _id: string;
  title: string;
  location: { name: string };
  status: 'open' | 'closed';
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
  const [recentReports, setRecentReports] = useState<WildlifeReport[]>([]);
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching data for user:', user._id);
        
        // Fetch recent reports
        const reportsResponse = await api.get(`/reports/user/${user._id}/recent`);
        console.log('Reports Response:', reportsResponse);

        if (reportsResponse.data && Array.isArray(reportsResponse.data.data)) {
          setRecentReports(reportsResponse.data.data);
        }

        // Fetch available projects (now volunteer requests)
        const projectsResponse = await api.get('/volunteer-requests?status=open');
        console.log('Projects Response:', projectsResponse);

        if (projectsResponse.data && Array.isArray(projectsResponse.data.data)) {
          setAvailableProjects(projectsResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
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
            {recentReports.length === 0 ? (
              <Card className="p-6 text-center text-gray-600">
                No recent reports. Start by submitting a new wildlife report.
              </Card>
            ) : (
              <div className="space-y-4">
                {recentReports.slice(0, 2).map((report) => (
                  <Card key={report._id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{report.title || 'Untitled Report'}</h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    
                    {report.photos && report.photos.length > 0 && (
                      <div className="mb-3">
                        <img 
                          src={report.photos[0]} 
                          alt="Report" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {report.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {report.urgency}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(report.submittedAt), 'PPp')}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {recentReports.length > 0 && (
              <Button asChild variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
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
            {availableProjects.length === 0 ? (
              <Card className="p-6 text-center text-gray-600">
                No available projects at the moment. Check back later!
              </Card>
            ) : (
              <div className="space-y-4">
                {availableProjects.length > 0 ? (
                  availableProjects.slice(0, 5).map((project) => (
                    <Card key={project._id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="h-4 w-4" /> {project.location.name}</p>
                    </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/volunteer/request/${project._id}`}>View</Link>
                      </Button>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center text-gray-600">
                    No available projects at the moment. Check back later!
                  </Card>
                )}
              </div>
            )}
            {availableProjects.length > 0 && (
              <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Link to="/volunteer/projects">View All Projects</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
