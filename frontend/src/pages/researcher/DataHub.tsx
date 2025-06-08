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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  Database,
  Search,
  Download,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Users,
  FileText,
  BarChart3,
  Globe,
  Lock,
  Unlock,
  Star,
  TrendingUp,
  Activity,
  Camera,
  Microscope,
} from "lucide-react";

export default function DataHub() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("datasets");

  // TODO: Fetch datasets and papers from MongoDB backend
  const datasets = [];
  const papers = [];

  const categories = [
    { value: "wildlife_monitoring", label: "Wildlife Monitoring", icon: "🦁" },
    { value: "biodiversity", label: "Biodiversity", icon: "🌿" },
    { value: "water_quality", label: "Water Quality", icon: "💧" },
    { value: "climate", label: "Climate Data", icon: "🌡️" },
    { value: "ecosystem_services", label: "Ecosystem Services", icon: "🌍" },
    { value: "conservation_policy", label: "Conservation Policy", icon: "📋" },
    { value: "habitat_restoration", label: "Habitat Restoration", icon: "🌳" },
  ];

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case "open":
        return <Unlock className="h-4 w-4 text-emerald-600" />;
      case "restricted":
        return <Lock className="h-4 w-4 text-red-600" />;
      case "upon_request":
        return <Eye className="h-4 w-4 text-amber-600" />;
      default:
        return <Lock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccessColor = (accessLevel: string) => {
    switch (accessLevel) {
      case "open":
        return "bg-emerald-100 text-emerald-800";
      case "restricted":
        return "bg-red-100 text-red-800";
      case "upon_request":
        return "bg-amber-100 text-amber-800";
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

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      categoryFilter === "all" || dataset.category === categoryFilter;
    const matchesLocation =
      locationFilter === "all" ||
      dataset.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesAccess =
      accessFilter === "all" || dataset.accessLevel === accessFilter;

    return matchesSearch && matchesCategory && matchesLocation && matchesAccess;
  });

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some((author) =>
        author.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      categoryFilter === "all" || paper.category === categoryFilter;
    const matchesAccess =
      accessFilter === "all" || paper.accessLevel === accessFilter;

    return matchesSearch && matchesCategory && matchesAccess;
  });

  const featuredDatasets = datasets.filter((d) => d.featured);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Research Data Hub
          </h1>
          <p className="text-gray-600">
            Access centralized research data, publications, and datasets from
            Rwanda's conservation community
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {datasets.length}
                  </p>
                  <p className="text-sm text-blue-700">Datasets Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {papers.length}
                  </p>
                  <p className="text-sm text-emerald-700">Research Papers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">2.1K</p>
                  <p className="text-sm text-amber-700">Total Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">45</p>
                  <p className="text-sm text-purple-700">
                    Contributing Researchers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Datasets */}
        {featuredDatasets.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Featured Datasets
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredDatasets.slice(0, 2).map((dataset) => (
                <Card
                  key={dataset.id}
                  className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {dataset.title}
                        </CardTitle>
                        <CardDescription>
                          by {dataset.researcher}
                        </CardDescription>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {dataset.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dataset.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(dataset.lastUpdated)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {dataset.fileSize}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAccessIcon(dataset.accessLevel)}
                        <Badge className={getAccessColor(dataset.accessLevel)}>
                          {dataset.accessLevel.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {dataset.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500" />
                          {dataset.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search datasets, papers, authors, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="volcanoes">Volcanoes NP</SelectItem>
                  <SelectItem value="nyungwe">Nyungwe NP</SelectItem>
                  <SelectItem value="akagera">Akagera NP</SelectItem>
                  <SelectItem value="kivu">Lake Kivu</SelectItem>
                  <SelectItem value="multiple">Multiple Sites</SelectItem>
                </SelectContent>
              </Select>
              <Select value={accessFilter} onValueChange={setAccessFilter}>
                <SelectTrigger className="w-full lg:w-32">
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                  <SelectItem value="upon_request">On Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datasets">
              Datasets ({filteredDatasets.length})
            </TabsTrigger>
            <TabsTrigger value="papers">
              Research Papers ({filteredPapers.length})
            </TabsTrigger>
          </TabsList>

          {/* Datasets Tab */}
          <TabsContent value="datasets" className="space-y-4">
            {filteredDatasets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No datasets found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search filters to find relevant datasets.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredDatasets.map((dataset) => (
                  <Card
                    key={dataset.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {dataset.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              by {dataset.researcher} • {dataset.organization}
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {dataset.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getAccessIcon(dataset.accessLevel)}
                            <Badge
                              className={getAccessColor(dataset.accessLevel)}
                            >
                              {dataset.accessLevel.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {dataset.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {dataset.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated {formatDate(dataset.lastUpdated)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {dataset.fileSize} ({dataset.fileFormat})
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {dataset.downloads} downloads
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500" />
                              {dataset.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {dataset.citations} citations
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Research Papers Tab */}
          <TabsContent value="papers" className="space-y-4">
            {filteredPapers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No research papers found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search filters to find relevant
                    publications.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPapers.map((paper) => (
                  <Card
                    key={paper.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {paper.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {paper.authors.join(", ")} • {paper.journal}
                            </p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {paper.abstract}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getAccessIcon(paper.accessLevel)}
                            <Badge
                              className={getAccessColor(paper.accessLevel)}
                            >
                              {paper.accessLevel.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Published {formatDate(paper.publishedDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {paper.citations} citations
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {paper.downloads} downloads
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            PDF ({paper.pdfSize})
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {categories.find((c) => c.value === paper.category)
                              ?.label || paper.category}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Abstract
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
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
