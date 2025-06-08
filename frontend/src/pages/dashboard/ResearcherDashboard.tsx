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
import { Progress } from "@/components/ui/progress";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

export default function ResearcherDashboard() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();

  // TODO: Fetch stats and active projects from MongoDB backend
  const stats = {};
  const activeProjects = [];

  const recentPublications = [
    {
      id: "1",
      title: "Camera Trap Data Analysis: Wildlife Population Trends in Nyungwe",
      journal: "African Journal of Ecology",
      date: "2024-01-10",
      downloads: 89,
      citations: 12,
    },
    {
      id: "2",
      title: "Community-Based Conservation: Lessons from Rwanda",
      journal: "Conservation Biology",
      date: "2023-12-15",
      downloads: 156,
      citations: 8,
    },
  ];

  const collaborationRequests = [
    {
      id: "1",
      title: "Need volunteers for bird counting survey",
      requiredSkills: ["Bird identification", "Data recording"],
      volunteers: 12,
      target: 20,
      deadline: "2024-02-15",
    },
    {
      id: "2",
      title: "Water quality monitoring assistance",
      requiredSkills: ["Basic chemistry", "GPS usage"],
      volunteers: 6,
      target: 15,
      deadline: "2024-02-28",
    },
  ];

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
          Research Dashboard 🔬
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
                {stats.publishedFindings}
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
                {stats.activeProjects}
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
                {stats.volunteerCollaborators}
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
                {stats.datasetDownloads}
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
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                        <span
                          className={`text-sm ${getPriorityColor(project.priority)}`}
                        >
                          {project.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{project.progress}% complete</span>
                      <span>{project.volunteers} volunteers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due {project.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/researcher/projects">Manage All Projects</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Publications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Recent Publications
            </CardTitle>
            <CardDescription>
              Your published research and findings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPublications.map((pub) => (
              <div key={pub.id} className="p-4 rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 leading-tight">
                    {pub.title}
                  </h4>
                  <p className="text-sm text-blue-600 font-medium">
                    {pub.journal}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{pub.date}</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {pub.downloads} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {pub.citations} citations
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/researcher/publications">View All Publications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Collaboration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Volunteer Collaboration Requests
          </CardTitle>
          <CardDescription>
            Get help from the volunteer community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collaborationRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border border-gray-200"
              >
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">{request.title}</h4>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {request.requiredSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Progress
                      value={(request.volunteers / request.target) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {request.volunteers}/{request.target} volunteers
                      </span>
                      <span>Due {request.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
              <Link to="/researcher/request-volunteers">
                Create New Request
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
