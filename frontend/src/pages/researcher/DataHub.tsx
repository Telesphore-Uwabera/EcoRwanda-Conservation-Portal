import React, { useState, useEffect } from "react";
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
import api from "@/config/api";
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
  AlertTriangle,
} from "lucide-react";
import { Alert as AlertDialog, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DataHubStats {
  datasetsAvailable: number;
  researchPapers: number;
  totalDownloads: number;
  contributingResearchers: number;
}

interface Dataset {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number; name: string };
  accessLevel: string;
  tags: string[];
  createdAt: string;
  downloads: number;
  featured?: boolean;
}

interface ResearchPaper {
  _id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  category: string;
  accessLevel: string;
  downloads: number;
}

export default function DataHub() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("datasets");

  const [stats, setStats] = useState<DataHubStats>({
    datasetsAvailable: 0,
    researchPapers: 0,
    totalDownloads: 0,
    contributingResearchers: 0,
  });
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataHubData = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }

        const response = await api.get('/data-hub', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data;

        setStats(data);
        // We don't have separate dataset/paper fetching yet, so leave these as empty for now
        // setDatasets(data.datasets);
        // setPapers(data.papers);
      } catch (err) {
        console.error('Error fetching data hub data:', err);
        setError('Failed to load data hub data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDataHubData();
    }
  }, [user]);


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

  // Currently, these filters are based on mock data. Will need to be updated
  // when actual dataset/paper fetching is implemented.
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
      dataset.location.name.toLowerCase().includes(locationFilter.toLowerCase());
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

  // Currently based on mock data. Will need to be updated with real data.
  const featuredDatasets = datasets.filter((d) => d.featured);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading data hub...</p>
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
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-600" />
            Research Data Hub
          </h1>
          <p className="text-gray-600">
            Access and manage shared research datasets and publications
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-800">
                Datasets Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900">
                  {stats.datasetsAvailable.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {stats.researchPapers.toLocaleString()}
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
                  <p className="text-2xl font-bold text-amber-900">
                    {stats.totalDownloads.toLocaleString()}
                  </p>
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
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.contributingResearchers.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-700">
                    Contributing Researchers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search datasets, papers, authors, or keywords..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[180px]">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="kigali">Kigali</SelectItem>
              <SelectItem value="musanze">Musanze</SelectItem>
              <SelectItem value="nyungwe">Nyungwe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accessFilter} onValueChange={setAccessFilter}>
            <SelectTrigger className="w-[180px]">
              <Lock className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="All Access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access</SelectItem>
              <SelectItem value="open">Open Access</SelectItem>
              <SelectItem value="restricted">Restricted Access</SelectItem>
              <SelectItem value="upon_request">Upon Request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datasets">Datasets ({datasets.length})</TabsTrigger>
            <TabsTrigger value="papers">Research Papers ({papers.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="datasets">
            <Card>
              <CardHeader>
                <CardTitle>Datasets</CardTitle>
                <CardDescription>Browse available datasets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredDatasets.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Database className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>No datasets found</p>
                    <p className="text-sm">
                      Try adjusting your search filters to find relevant datasets.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredDatasets.map((dataset) => (
                      <Card key={dataset._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            {dataset.title}
                          </CardTitle>
                          <Badge className={getAccessColor(dataset.accessLevel)}>
                            {getAccessIcon(dataset.accessLevel)}
                            {dataset.accessLevel.replace("_", " ")}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {dataset.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {dataset.location.name}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Published: {formatDate(dataset.createdAt)}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {dataset.downloads.toLocaleString()} Downloads
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dataset.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {dataset.featured && (
                            <Badge variant="default" className="bg-yellow-500 text-white flex items-center gap-1 mt-2">
                              <Star className="h-3 w-3 fill-current" /> Featured
                            </Badge>
                          )}
                          <Button size="sm" className="mt-3">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="papers">
            <Card>
              <CardHeader>
                <CardTitle>Research Papers</CardTitle>
                <CardDescription>Explore published research papers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredPapers.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>No research papers found</p>
                    <p className="text-sm">
                      Try adjusting your search filters to find relevant papers.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredPapers.map((paper) => (
                      <Card key={paper._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            {paper.title}
                          </CardTitle>
                          <Badge className={getAccessColor(paper.accessLevel)}>
                            {getAccessIcon(paper.accessLevel)}
                            {paper.accessLevel.replace("_", " ")}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {paper.abstract}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Authors: {paper.authors.join(", ")}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Published: {formatDate(paper.publicationDate)}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {paper.downloads.toLocaleString()} Downloads
                            </Badge>
                          </div>
                          <Button size="sm" className="mt-3">
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
