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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  TreePine,
  Search,
  MapPin,
  Users,
  Calendar,
  Award,
  Clock,
  Target,
  Heart,
  Leaf,
  Mountain,
  Droplets,
  UserPlus,
  ExternalLink,
  Star,
} from "lucide-react";

export default function ViewProjects() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("available");

  // TODO: Fetch projects from MongoDB backend
  const allProjects = [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reforestation":
        return <TreePine className="h-5 w-5 text-emerald-600" />;
      case "wildlife_monitoring":
        return <Mountain className="h-5 w-5 text-amber-600" />;
      case "water_conservation":
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case "education":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "cleanup":
        return <Leaf className="h-5 w-5 text-green-600" />;
      default:
        return <Heart className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-800";
      case "Intermediate":
        return "bg-amber-100 text-amber-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "all" ||
      project.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    // Filter by tab
    if (activeTab === "joined") {
      return (
        project.isJoined && matchesSearch && matchesLocation && matchesStatus
      );
    } else if (activeTab === "available") {
      return (
        !project.isJoined &&
        project.status === "active" &&
        matchesSearch &&
        matchesLocation &&
        matchesStatus
      );
    }

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const featuredProjects = allProjects.filter(
    (p) => p.featured && !p.isJoined && p.status === "active",
  );
  const joinedProjects = allProjects.filter((p) => p.isJoined);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateProgress = (achieved: number, target: number) => {
    return Math.min((achieved / target) * 100, 100);
  };

  return (
    <DashboardLayout>
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TreePine className="h-8 w-8 text-emerald-600" />
            Conservation Projects
          </h1>
          <p className="text-gray-600">
            Join ongoing conservation initiatives and make a direct impact on
            Rwanda's ecosystems
          </p>
        </div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && activeTab === "available" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredProjects.slice(0, 2).map((project) => (
                <Card
                  key={project.id}
                  className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(project.type)}
                        <div>
                          <CardTitle className="text-lg">
                            {project.title}
                          </CardTitle>
                          <CardDescription>
                            {project.organization}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Impact Progress</span>
                        <span className="font-medium">
                          {project.impact.achieved.toLocaleString()} /{" "}
                          {project.impact.target.toLocaleString()}{" "}
                          {project.impact.unit}
                        </span>
                      </div>
                      <Progress
                        value={calculateProgress(
                          project.impact.achieved,
                          project.impact.target,
                        )}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-3 w-3" />
                        {project.volunteers}/{project.targetVolunteers}{" "}
                        volunteers
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3 w-3" />
                        Until {formatDate(project.endDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="text-amber-600 font-medium">
                          {project.rating}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Tabs */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Projects</TabsTrigger>
              <TabsTrigger value="joined">
                My Projects ({joinedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="all">All Projects</TabsTrigger>
            </TabsList>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search projects by title, organization, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="nyungwe">Nyungwe NP</SelectItem>
                      <SelectItem value="akagera">Akagera NP</SelectItem>
                      <SelectItem value="volcanoes">Volcanoes NP</SelectItem>
                      <SelectItem value="kigali">Kigali</SelectItem>
                      <SelectItem value="multiple">Multiple Sites</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No projects found
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === "joined"
                        ? "You haven't joined any projects yet. Explore available projects to get started!"
                        : "Try adjusting your search filters to find projects that interest you."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <Card
                      key={project.id}
                      className={
                        project.isJoined
                          ? "border-emerald-200 bg-emerald-50/30"
                          : ""
                      }
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(project.type)}
                            <div>
                              <CardTitle className="text-lg">
                                {project.title}
                              </CardTitle>
                              <CardDescription>
                                {project.organization}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            {project.isJoined && (
                              <Badge className="bg-emerald-100 text-emerald-800">
                                Joined
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Impact Progress
                            </span>
                            <span className="font-medium">
                              {project.impact.achieved.toLocaleString()} /{" "}
                              {project.impact.target.toLocaleString()}{" "}
                              {project.impact.unit}
                            </span>
                          </div>
                          <Progress
                            value={calculateProgress(
                              project.impact.achieved,
                              project.impact.target,
                            )}
                            className="h-2"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.volunteers}/{project.targetVolunteers}{" "}
                            volunteers
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.timeCommitment}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <Badge
                              className={getDifficultyColor(project.difficulty)}
                              variant="outline"
                            >
                              {project.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {project.requiredSkills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {project.requiredSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.requiredSkills.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {project.isJoined ? (
                            <>
                              <Button variant="outline" className="flex-1">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Project
                              </Button>
                              <Button variant="outline" className="flex-1">
                                Project Updates
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" className="flex-1">
                                Learn More
                              </Button>
                              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Join Project
                              </Button>
                            </>
                          )}
                        </div>

                        {(project.rating || project.completedVolunteers) && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm text-gray-600">
                            {project.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500" />
                                <span>{project.rating} rating</span>
                              </div>
                            )}
                            {project.completedVolunteers > 0 && (
                              <div className="flex items-center gap-1">
                                <Award className="h-3 w-3 text-blue-500" />
                                <span>
                                  {project.completedVolunteers} completed
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
