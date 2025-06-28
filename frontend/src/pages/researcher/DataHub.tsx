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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
  owner?: { name: string; email: string };
  downloadUrl?: string;
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
  createdAt: string;
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

  // Publication form state
  const initialPublicationForm = {
    title: '',
    description: '',
    organization: '',
    location: '',
    abstract: '',
    authors: '',
    publicationDate: '',
    startDate: '',
    endDate: '',
    accessLevel: 'open',
    category: '',
    images: '',
    doi: '',
    methodology: '',
    fundingSource: '',
    ethicalApproval: '',
    publicationLink: '',
  };
  const [publicationForm, setPublicationForm] = useState(initialPublicationForm);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Dynamic field helpers for contributors, authors, references, keywords, supplementary files
  const [contributors, setContributors] = useState([{ name: '', role: '', email: '' }]);
  const [authors, setAuthors] = useState(['']);
  const [references, setReferences] = useState(['']);
  const [keywords, setKeywords] = useState(['']);
  const [supplementaryFiles, setSupplementaryFiles] = useState(['']);
  const [showDatasetForm, setShowDatasetForm] = useState(false);
  const [datasetsList, setDatasetsList] = useState<Dataset[]>([]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  // Dataset creation form state
  const initialDatasetForm = {
    title: '',
    description: '',
    category: '',
    location: { name: '', lat: '', lng: '' },
    accessLevel: 'open',
    tags: [''],
    downloadUrl: '',
    researchType: '',
  };
  const [datasetForm, setDatasetForm] = useState(initialDatasetForm);
  const [isCreatingDataset, setIsCreatingDataset] = useState(false);
  const [datasetCreateError, setDatasetCreateError] = useState('');
  const [datasetCreateSuccess, setDatasetCreateSuccess] = useState(false);

  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showDatasetDialog, setShowDatasetDialog] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  // Add state for selectedPaper and showPaperDialog
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [showPaperDialog, setShowPaperDialog] = useState(false);

  // New state for requesting access to a research paper
  const [requestingPaperId, setRequestingPaperId] = useState<string | null>(null);
  const [requestPaperMessage, setRequestPaperMessage] = useState("");

  // Add impact state near the top of the component:
  const [impact, setImpact] = useState({
    treesPlanted: 0,
    wildlifeProtected: 0,
    areaRestored: 0
  });

  // Helper to parse date to ISO
  function parseDateToISO(dateStr: string | undefined): string | undefined {
    if (!dateStr) return undefined;
    // If already in YYYY-MM-DD, just return new Date().toISOString()
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr).toISOString();
    }
    // If in DD/MM/YYYY, convert to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    // Fallback: try Date constructor
    return new Date(dateStr).toISOString();
  }

  // Helper to fetch and update all DataHub data (summary, datasets, papers)
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
      setStats({
        datasetsAvailable: data.datasetsAvailable,
        researchPapers: data.researchPapers,
        totalDownloads: data.totalDownloads,
        contributingResearchers: data.contributingResearchers,
      });
      setDatasets(data.datasets || []);
      setPapers(data.papers || []);
    } catch (err) {
      console.error('Error fetching data hub data:', err);
      setError('Failed to load data hub data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDataHubData();
    }
  }, [user]);

  // Fetch datasets for selection
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }
        const response = await api.get('/data-hub/datasets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setDatasetsList(response.data.data);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchDatasets();
  }, []);

  const handlePublicationInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPublicationForm({ ...publicationForm, [e.target.name]: e.target.value });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishError('');
    setPublishSuccess(false);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      let userObj = null;
      if (storedUser) {
        userObj = JSON.parse(storedUser);
        token = userObj.token;
      }
      // Debug log for publicationForm state
      console.log('publicationForm:', publicationForm);
      alert(JSON.stringify(publicationForm, null, 2));
      // Log raw date values
      console.log('Raw startDate:', publicationForm.startDate);
      console.log('Raw endDate:', publicationForm.endDate);
      // Convert startDate and endDate to ISO format using helper
      const payload = {
        ...publicationForm,
        startDate: parseDateToISO(publicationForm.startDate),
        endDate: parseDateToISO(publicationForm.endDate),
        authors: authors.filter(a => a.trim()),
        contributors: contributors.filter(c => c.name.trim() && c.role.trim()),
        references: references.length > 0 ? references : [],
        keywords: keywords.length > 0 ? keywords : [],
        supplementaryFiles: supplementaryFiles.length > 0 ? supplementaryFiles : [],
        datasets: selectedDatasets,
        impact,
        doi: publicationForm.doi || '',
        fundingSource: publicationForm.fundingSource || '',
        publicationLink: publicationForm.publicationLink || '',
        methodology: publicationForm.methodology || '',
        ethicalApproval: publicationForm.ethicalApproval || '',
      };
      console.log('Publishing payload:', payload);
      const response = await api.post('/conservation-projects/publish', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPublishSuccess(true);
        setPublicationForm(initialPublicationForm);
        setAuthors(['']);
        setContributors([{ name: '', role: '', email: '' }]);
        setReferences(['']);
        setKeywords(['']);
        setSupplementaryFiles(['']);
        setSelectedDatasets([]);
        setImpact({ treesPlanted: 0, wildlifeProtected: 0, areaRestored: 0 });
        // Refresh all DataHub data (summary, datasets, papers)
        fetchDataHubData();
      } else {
        setPublishError(response.data.error || 'Failed to publish.');
      }
    } catch (err: any) {
      setPublishError(err.response?.data?.error || err.message || 'Failed to publish.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handlers for dynamic fields
  const handleContributorChange = (idx: number, field: string, value: string) => {
    const updated = [...contributors];
    updated[idx][field] = value;
    setContributors(updated);
  };
  const addContributor = () => setContributors([...contributors, { name: '', role: '', email: '' }]);
  const removeContributor = (idx: number) => setContributors(contributors.filter((_, i) => i !== idx));

  const handleAuthorChange = (idx: number, value: string) => {
    const updated = [...authors];
    updated[idx] = value;
    setAuthors(updated);
  };
  const addAuthor = () => setAuthors([...authors, '']);
  const removeAuthor = (idx: number) => setAuthors(authors.filter((_, i) => i !== idx));

  const handleReferenceChange = (idx: number, value: string) => {
    const updated = [...references];
    updated[idx] = value;
    setReferences(updated);
  };
  const addReference = () => setReferences([...references, '']);
  const removeReference = (idx: number) => setReferences(references.filter((_, i) => i !== idx));

  const handleKeywordChange = (idx: number, value: string) => {
    const updated = [...keywords];
    updated[idx] = value;
    setKeywords(updated);
  };
  const addKeyword = () => setKeywords([...keywords, '']);
  const removeKeyword = (idx: number) => setKeywords(keywords.filter((_, i) => i !== idx));

  const handleSupplementaryFileChange = (idx: number, value: string) => {
    const updated = [...supplementaryFiles];
    updated[idx] = value;
    setSupplementaryFiles(updated);
  };
  const addSupplementaryFile = () => setSupplementaryFiles([...supplementaryFiles, '']);
  const removeSupplementaryFile = (idx: number) => setSupplementaryFiles(supplementaryFiles.filter((_, i) => i !== idx));

  // Dataset form handlers
  const handleDatasetInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatasetForm({ ...datasetForm, [name]: value });
  };
  const handleDatasetLocationChange = (field: string, value: string) => {
    setDatasetForm((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }));
  };
  const handleDatasetTagChange = (idx: number, value: string) => {
    const updated = [...datasetForm.tags];
    updated[idx] = value;
    setDatasetForm((prev) => ({ ...prev, tags: updated }));
  };
  const addDatasetTag = () => setDatasetForm((prev) => ({ ...prev, tags: [...prev.tags, ''] }));
  const removeDatasetTag = (idx: number) => setDatasetForm((prev) => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }));

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingDataset(true);
    setDatasetCreateError('');
    setDatasetCreateSuccess(false);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      let userObj = null;
      if (storedUser) {
        userObj = JSON.parse(storedUser);
        token = userObj.token;
      }
      const payload = {
        ...datasetForm,
        tags: datasetForm.tags.filter((t) => t.trim()),
        owner: userObj?._id,
      };
      const response = await api.post('/data-hub/datasets', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setDatasetCreateSuccess(true);
        setDatasetForm(initialDatasetForm);
        setShowDatasetForm(false);
        // Refresh all DataHub data (summary, datasets, papers)
        fetchDataHubData();
      } else {
        setDatasetCreateError(response.data.error || 'Failed to create dataset.');
      }
    } catch (err: any) {
      setDatasetCreateError(err.response?.data?.error || 'Failed to create dataset.');
    } finally {
      setIsCreatingDataset(false);
    }
  };

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

  // Request access handler
  const handleRequestAccess = async () => {
    if (!selectedDataset || !selectedDataset.owner || !selectedDataset.owner.email) return;
    setRequestingAccess(true);
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      let userObj = null;
      if (storedUser) {
        userObj = JSON.parse(storedUser);
        token = userObj.token;
      }
      await api.post('/data-hub/request-dataset-access', {
        datasetId: selectedDataset._id,
        ownerEmail: selectedDataset.owner.email,
        message: requestMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Access request sent to the publisher.');
      setShowDatasetDialog(false);
      setRequestMessage("");
    } catch (err: any) {
      toast.error('Failed to send access request.');
    } finally {
      setRequestingAccess(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading data hub...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {typeof stats.datasetsAvailable === 'number' ? stats.datasetsAvailable.toLocaleString() : 'N/A'}
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
                    {typeof stats.researchPapers === 'number' ? stats.researchPapers.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-sm text-emerald-700">Research Papers</p>
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
                    {typeof stats.contributingResearchers === 'number' ? stats.contributingResearchers.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-sm text-purple-700">
                    Total Contributors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 my-6 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Search datasets, papers, authors, or keywords..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
                              Published: {dataset.createdAt ? new Date(dataset.createdAt).toLocaleString() : 'N/A'}
                            </Badge>
                            {typeof dataset.downloads === 'number' && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {dataset.downloads.toLocaleString()} Downloads
                              </Badge>
                            )}
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
                          <Button size="sm" className="mt-3" onClick={() => { setSelectedDataset(dataset); setShowDatasetDialog(true); }}>
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
                              Published: {paper.createdAt ? new Date(paper.createdAt).toLocaleString() : 'N/A'}
                            </Badge>
                            {typeof paper.downloads === 'number' && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {paper.downloads.toLocaleString()} Downloads
                              </Badge>
                            )}
                          </div>
                          {paper.accessLevel === 'open' ? (
                            <div className="text-gray-800 mb-2">{paper.abstract || 'No abstract provided.'}</div>
                          ) : paper.accessLevel === 'restricted' ? (
                            <div className="text-red-600 font-semibold mb-2">Access Restricted</div>
                          ) : (
                            <div className="mb-2">
                              <div className="text-amber-700 font-semibold mb-2">Access available upon request</div>
                              {requestingPaperId === paper._id ? (
                                <form
                                  onSubmit={e => {
                                    e.preventDefault();
                                    toast.success('Access request sent!');
                                    setRequestingPaperId(null);
                                    setRequestPaperMessage("");
                                  }}
                                  className="flex flex-col gap-2"
                                >
                                  <textarea
                                    className="border rounded p-2"
                                    placeholder="Enter your request message"
                                    value={requestPaperMessage}
                                    onChange={e => setRequestPaperMessage(e.target.value)}
                                    required
                                  />
                                  <div className="flex gap-2">
                                    <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded">Send Request</button>
                                    <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setRequestingPaperId(null)}>Cancel</button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  className="bg-amber-600 text-white px-3 py-1 rounded"
                                  onClick={() => setRequestingPaperId(paper._id)}
                                >
                                  Request Access
                                </button>
                              )}
                            </div>
                          )}
                          <Link to={`/publications/${paper._id}`}>
                            <Button size="sm" className="mt-3">
                              View Details
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Publication Form for Researchers */}
        {user?.role === 'researcher' && (
          <Card className="my-8">
            <CardHeader>
              <CardTitle>Publish Completed Research Paper</CardTitle>
              <CardDescription>Fill out the form below to publish your completed research as a conservation project publication.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublish} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Title</label>
                    <Input name="title" value={publicationForm.title} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Organization</label>
                    <Input name="organization" value={publicationForm.organization} onChange={handlePublicationInput} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <Input name="description" value={publicationForm.description} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Location</label>
                    <Input name="location" value={publicationForm.location} onChange={handlePublicationInput} required placeholder="e.g., Nyungwe National Park" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Abstract</label>
                    <Input name="abstract" value={publicationForm.abstract} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Category</label>
                    <select name="category" value={publicationForm.category} onChange={handlePublicationInput} required className="w-full border rounded px-2 py-1">
                      <option value="">Select Category</option>
                      <option value="wildlife">Wildlife</option>
                      <option value="forest">Forest</option>
                      <option value="water">Water</option>
                      <option value="community">Community</option>
                      <option value="research">Research</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Publication Date</label>
                    <Input name="publicationDate" type="date" value={publicationForm.publicationDate} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Access Level</label>
                    <select name="accessLevel" value={publicationForm.accessLevel} onChange={handlePublicationInput} className="w-full border rounded px-2 py-1">
                      <option value="open">Open</option>
                      <option value="restricted">Restricted</option>
                      <option value="upon_request">Upon Request</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Start Date</label>
                    <Input name="startDate" type="date" value={publicationForm.startDate} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">End Date</label>
                    <Input name="endDate" type="date" value={publicationForm.endDate} onChange={handlePublicationInput} required />
                  </div>
                </div>
                {/* Dynamic Authors */}
                <div>
                  <label className="block font-medium mb-1">Authors</label>
                  {authors.map((author, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input value={author} onChange={e => handleAuthorChange(idx, e.target.value)} placeholder="Author name" required />
                      {authors.length > 1 && <Button type="button" variant="destructive" onClick={() => removeAuthor(idx)}>-</Button>}
                      {idx === authors.length - 1 && <Button type="button" onClick={addAuthor}>+</Button>}
                    </div>
                  ))}
                </div>
                {/* Dynamic Contributors */}
                <div>
                  <label className="block font-medium mb-1">Contributors</label>
                  {contributors.map((contributor, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 mb-2">
                      <Input value={contributor.name} onChange={e => handleContributorChange(idx, 'name', e.target.value)} placeholder="Name" required />
                      <Input value={contributor.role} onChange={e => handleContributorChange(idx, 'role', e.target.value)} placeholder="Role" required />
                      <Input value={contributor.email} onChange={e => handleContributorChange(idx, 'email', e.target.value)} placeholder="Email" />
                      {contributors.length > 1 && <Button type="button" variant="destructive" onClick={() => removeContributor(idx)}>-</Button>}
                      {idx === contributors.length - 1 && <Button type="button" onClick={addContributor}>+</Button>}
                    </div>
                  ))}
                </div>
                {/* Dynamic References */}
                <div>
                  <label className="block font-medium mb-1">References (Links)</label>
                  {references.map((ref, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input value={ref} onChange={e => handleReferenceChange(idx, e.target.value)} placeholder="Reference link" required />
                      {references.length > 1 && <Button type="button" variant="destructive" onClick={() => removeReference(idx)}>-</Button>}
                      {idx === references.length - 1 && <Button type="button" onClick={addReference}>+</Button>}
                    </div>
                  ))}
                </div>
                {/* Dynamic Keywords */}
                <div>
                  <label className="block font-medium mb-1">Keywords</label>
                  {keywords.map((kw, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input value={kw} onChange={e => handleKeywordChange(idx, e.target.value)} placeholder="Keyword" required />
                      {keywords.length > 1 && <Button type="button" variant="destructive" onClick={() => removeKeyword(idx)}>-</Button>}
                      {idx === keywords.length - 1 && <Button type="button" onClick={addKeyword}>+</Button>}
                    </div>
                  ))}
                </div>
                {/* Dynamic Supplementary Files */}
                <div>
                  <label className="block font-medium mb-1">Supplementary Files (Links)</label>
                  {supplementaryFiles.map((file, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input value={file} onChange={e => handleSupplementaryFileChange(idx, e.target.value)} placeholder="Supplementary file link" required />
                      {supplementaryFiles.length > 1 && <Button type="button" variant="destructive" onClick={() => removeSupplementaryFile(idx)}>-</Button>}
                      {idx === supplementaryFiles.length - 1 && <Button type="button" onClick={addSupplementaryFile}>+</Button>}
                    </div>
                  ))}
                </div>
                {/* Dataset Selection/Creation */}
                <div>
                  <label className="block font-medium mb-1">Datasets</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Select value={''} onValueChange={val => setSelectedDatasets([...selectedDatasets, val])}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Select dataset to link" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasetsList.map(ds => (
                          <SelectItem key={ds._id} value={ds._id}>{ds.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={() => setShowDatasetForm(true)}>+ Create New Dataset</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDatasets.map((dsId, idx) => {
                      const ds = datasetsList.find(d => d._id === dsId);
                      return ds ? (
                        <Badge key={dsId} variant="secondary">{ds.title} <Button type="button" size="sm" variant="destructive" onClick={() => setSelectedDatasets(selectedDatasets.filter((_, i) => i !== idx))}>x</Button></Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                {/* DOI, Methodology, Funding Source, Ethical Approval, Publication Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">DOI</label>
                    <Input name="doi" value={publicationForm.doi || ''} onChange={handlePublicationInput} placeholder="DOI" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Methodology</label>
                    <Input name="methodology" value={publicationForm.methodology || ''} onChange={handlePublicationInput} placeholder="Methodology" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Funding Source</label>
                    <Input name="fundingSource" value={publicationForm.fundingSource || ''} onChange={handlePublicationInput} placeholder="Funding Source" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Ethical Approval</label>
                    <Input name="ethicalApproval" value={publicationForm.ethicalApproval || ''} onChange={handlePublicationInput} placeholder="Ethical Approval" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Publication Link</label>
                    <Input name="publicationLink" value={publicationForm.publicationLink || ''} onChange={handlePublicationInput} placeholder="Publication Link" />
                  </div>
                </div>
                {/* Impact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Trees Planted</label>
                    <Input
                      type="number"
                      min={0}
                      value={impact.treesPlanted}
                      onChange={e => setImpact({ ...impact, treesPlanted: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Wildlife Protected</label>
                    <Input
                      type="number"
                      min={0}
                      value={impact.wildlifeProtected}
                      onChange={e => setImpact({ ...impact, wildlifeProtected: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Area Restored</label>
                    <Input
                      type="number"
                      min={0}
                      value={impact.areaRestored}
                      onChange={e => setImpact({ ...impact, areaRestored: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                {publishError && <div className="text-red-600">{publishError}</div>}
                {publishSuccess && <div className="text-green-600">Research paper published successfully!</div>}
                <Button type="submit" disabled={isPublishing}>{isPublishing ? 'Publishing...' : 'Publish Research Paper'}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dataset Creation Modal/Form */}
        {showDatasetForm && (
          <Card className="my-8">
            <CardHeader>
              <CardTitle>Create New Dataset</CardTitle>
              <CardDescription>Fill out the form below to create a new dataset. Only metadata and a download URL are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDataset} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Title</label>
                    <Input name="title" value={datasetForm.title} onChange={handleDatasetInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Category</label>
                    <Input name="category" value={datasetForm.category} onChange={handleDatasetInput} required />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <Input name="description" value={datasetForm.description} onChange={handleDatasetInput} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Location Name</label>
                    <Input name="locationName" value={datasetForm.location.name} onChange={e => handleDatasetLocationChange('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Latitude</label>
                    <Input name="locationLat" value={datasetForm.location.lat} onChange={e => handleDatasetLocationChange('lat', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Longitude</label>
                    <Input name="locationLng" value={datasetForm.location.lng} onChange={e => handleDatasetLocationChange('lng', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Access Level</label>
                  <select name="accessLevel" value={datasetForm.accessLevel} onChange={handleDatasetInput} className="w-full border rounded px-2 py-1">
                    <option value="open">Open</option>
                    <option value="restricted">Restricted</option>
                    <option value="upon_request">Upon Request</option>
                  </select>
                </div>
                {/* Dynamic Tags */}
                <div>
                  <label className="block font-medium mb-1">Tags</label>
                  {datasetForm.tags.map((tag, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input value={tag} onChange={e => handleDatasetTagChange(idx, e.target.value)} placeholder="Tag" required />
                      {datasetForm.tags.length > 1 && <Button type="button" variant="destructive" onClick={() => removeDatasetTag(idx)}>-</Button>}
                      {idx === datasetForm.tags.length - 1 && <Button type="button" onClick={addDatasetTag}>+</Button>}
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block font-medium mb-1">Download URL</label>
                  <Input name="downloadUrl" value={datasetForm.downloadUrl} onChange={handleDatasetInput} required placeholder="https://..." />
                </div>
                <div>
                  <label className="block font-medium mb-1">Research Type</label>
                  <Input name="researchType" value={datasetForm.researchType} onChange={handleDatasetInput} />
                </div>
                {datasetCreateError && <div className="text-red-600">{datasetCreateError}</div>}
                {datasetCreateSuccess && <div className="text-green-600">Dataset created successfully!</div>}
                <Button type="submit" disabled={isCreatingDataset}>{isCreatingDataset ? 'Creating...' : 'Create Dataset'}</Button>
                <Button type="button" variant="secondary" onClick={() => setShowDatasetForm(false)}>Cancel</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Dataset Details Dialog */}
        <Dialog open={showDatasetDialog} onOpenChange={setShowDatasetDialog}>
          <DialogContent className="max-w-lg w-full">
            {selectedDataset && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedDataset.title}</DialogTitle>
                  <DialogDescription>{selectedDataset.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-2">
                  <div><b>Category:</b> {selectedDataset.category}</div>
                  <div><b>Location:</b> {selectedDataset.location?.name}</div>
                  <div><b>Tags:</b> {selectedDataset.tags?.join(', ')}</div>
                  <div><b>Access Level:</b> {selectedDataset.accessLevel.replace('_', ' ')}</div>
                  <div><b>Published:</b> {selectedDataset.createdAt ? new Date(selectedDataset.createdAt).toLocaleString() : 'N/A'}</div>
                  {selectedDataset.owner && (
                    <div><b>Publisher:</b> {selectedDataset.owner.name} ({selectedDataset.owner.email})</div>
                  )}
                </div>
                {selectedDataset.accessLevel === 'open' && (
                  <DialogFooter className="mt-4">
                    <Button asChild>
                      <a href={selectedDataset.downloadUrl} target="_blank" rel="noopener noreferrer">Download Dataset</a>
                    </Button>
                  </DialogFooter>
                )}
                {selectedDataset.accessLevel === 'restricted' && (
                  <div className="mt-4 text-red-600 font-semibold">Access Restricted</div>
                )}
                {selectedDataset.accessLevel === 'upon_request' && (
                  <div className="mt-4 space-y-2">
                    <div className="font-semibold">Request Access</div>
                    <Input
                      placeholder="Message to publisher (optional)"
                      value={requestMessage}
                      onChange={e => setRequestMessage(e.target.value)}
                      disabled={requestingAccess}
                    />
                    <Button onClick={handleRequestAccess} disabled={requestingAccess} className="w-full mt-2">
                      {requestingAccess ? 'Requesting...' : 'Send Request'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Research Paper Details Dialog */}
        <Dialog open={showPaperDialog} onOpenChange={setShowPaperDialog}>
          <DialogContent className="max-w-lg w-full">
            {selectedPaper && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedPaper.title}</DialogTitle>
                  <DialogDescription>{selectedPaper.abstract}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2 mt-2">
                  <div><b>Authors:</b> {selectedPaper.authors?.join(', ')}</div>
                  <div><b>Category:</b> {selectedPaper.category}</div>
                  <div><b>Access Level:</b> {selectedPaper.accessLevel?.replace('_', ' ')}</div>
                  <div><b>Published:</b> {selectedPaper.createdAt ? new Date(selectedPaper.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}
