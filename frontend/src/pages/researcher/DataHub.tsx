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
import { THREAT_CATEGORIES } from '@/components/common/categories';

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
  owners?: { name: string; email: string }[];
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
  createdBy?: { name: string; email: string };
  owners?: { name: string; email: string }[];
  description?: string;
  ownerEmail?: string; // Add this line
  references?: string[];
  keywords?: string[];
  supplementaryFiles?: string[];
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
    location: { name: '', lat: '', lng: '' },
    abstract: '',
    authors: '',
    publicationDate: '',
    startDate: '',
    endDate: '',
    accessLevel: 'open',
    category: '',
    doi: '',
    methodology: '',
    fundingSource: '',
    ethicalApproval: '',
    publicationLink: '',
    references: [''],
    keywords: [''],
    supplementaryFiles: [''],
    objectives: [''],
    tags: [''],
    status: 'planning',
    publicationLinks: [''],
    budget: { total: '', spent: '', currency: 'RWF' },
    images: [],
    teamMembers: [{ name: '', email: '', role: '' }],
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
    featured: false,
    owners: [{ name: '', email: '' }],
    relatedProject: '',
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

  // Add these state and filter logic at the top of the component:
  const [datasetSearchTerm, setDatasetSearchTerm] = useState("");

  // Add state for objectives, tags, publicationLinks, teamMembers, images
  const [objectives, setObjectives] = useState(['']);
  const [tags, setTags] = useState(['']);
  const [publicationLinks, setPublicationLinks] = useState(['']);
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '', role: '' }]);
  const [images, setImages] = useState([]);

  // Add state for showing the Publish Completed Research Paper form
  const [showPaperForm, setShowPaperForm] = useState(false);

  // 1. Add state for projects
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');

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

  // 2. Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // The api instance already prepends /api, so use '/researchprojects'
        const response = await api.get('/researchprojects');
        setProjects(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err) {
        // ignore
      }
    };
    fetchProjects();
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
      const requiredFields = [
        publicationForm.title,
        publicationForm.description,
        publicationForm.organization,
        publicationForm.location && publicationForm.location.name,
        publicationForm.publicationDate,
        publicationForm.category,
        (publicationForm.abstract || publicationForm.description),
        (publicationForm.abstract || publicationForm.description), // for content
        teamMembers && teamMembers.length > 0 && teamMembers.some(m => m.name)
      ];
      if (requiredFields.some(f => !f)) {
        setPublishError('Please fill in all required fields (title, description, organization, location, abstract/content, at least one author, publication date, category).');
        return;
      }
      // Debug log for publicationForm state
      console.log('publicationForm:', publicationForm);
      alert(JSON.stringify(publicationForm, null, 2));
      // Log raw date values
      console.log('Raw startDate:', publicationForm.startDate);
      console.log('Raw endDate:', publicationForm.endDate);
      // Convert startDate and endDate to ISO format using helper
      const payload = {
        title: publicationForm.title,
        description: publicationForm.description,
        organization: publicationForm.organization,
        location: publicationForm.location.name, // send only the name as string
        abstract: publicationForm.abstract || publicationForm.description,
        content: publicationForm.abstract || publicationForm.description,
        authors: teamMembers.map(m => m.name).filter(Boolean),
        publicationDate: publicationForm.publicationDate,
        category: publicationForm.category,
        startDate: publicationForm.startDate,
        endDate: publicationForm.endDate,
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
        images: images, // <-- ensure images are included
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

  // Add handlers for objectives
  const handleObjectiveChange = (idx: number, value: string) => {
    setObjectives(prev => prev.map((obj, i) => (i === idx ? value : obj)));
  };
  const addObjective = () => setObjectives(prev => [...prev, '']);
  const removeObjective = (idx: number) => setObjectives(prev => prev.filter((_, i) => i !== idx));

  // Add similar handlers for tags, publicationLinks, teamMembers if not already defined.
  const handleTagChange = (idx: number, value: string) => {
    const updated = [...tags];
    updated[idx] = value;
    setTags(updated);
  };
  const addTag = () => setTags([...tags, '']);
  const removeTag = (idx: number) => setTags(tags.filter((_, i) => i !== idx));

  const handlePublicationLinkChange = (idx: number, value: string) => {
    const updated = [...publicationLinks];
    updated[idx] = value;
    setPublicationLinks(updated);
  };
  const addPublicationLink = () => setPublicationLinks([...publicationLinks, '']);
  const removePublicationLink = (idx: number) => setPublicationLinks(publicationLinks.filter((_, i) => i !== idx));

  const handleTeamMemberChange = (idx: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[idx][field] = value;
    setTeamMembers(updated);
  };
  const addTeamMember = () => setTeamMembers([...teamMembers, { name: '', email: '', role: '' }]);
  const removeTeamMember = (idx: number) => setTeamMembers(teamMembers.filter((_, i) => i !== idx));

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
      const payload = { ...datasetForm };
      if (!payload.relatedProject) delete payload.relatedProject;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Currently, these filters are based on mock data. Will need to be updated
  // when actual dataset/paper fetching is implemented.
  const filteredDatasetsForDisplay = datasets.filter((dataset) => {
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
      (paper.abstract || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (!selectedDataset || !selectedDataset.owners || selectedDataset.owners.length === 0) return;
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
        owners: selectedDataset.owners.map(o => o?.email),
        message: requestMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Access request sent to the publishers.');
      setShowDatasetDialog(false);
      setRequestMessage("");
    } catch (err: any) {
      toast.error('Failed to send access request.');
    } finally {
      setRequestingAccess(false);
    }
  };

  // Update the filteredDatasets variable for the publication form:
  const filteredDatasets = datasetsList.filter(ds =>
    !selectedDatasets.includes(ds._id) && (
      ds.title.toLowerCase().includes(datasetSearchTerm.toLowerCase()) ||
      ds.category.toLowerCase().includes(datasetSearchTerm.toLowerCase()) ||
      ds.tags.some(tag => tag.toLowerCase().includes(datasetSearchTerm.toLowerCase()))
    )
  );

  // Add handler for location fields
  const handleLocationChange = (field: 'name' | 'lat' | 'lng', value: string) => {
    setPublicationForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Add handler for budget fields
  const handleBudgetChange = (field: 'total' | 'spent' | 'currency', value: string) => {
    setPublicationForm(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value,
      },
    }));
  };

  // Add handler for image upload (Cloudinary)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('upload_preset', 'ecorwanda'); // Replace with your actual preset if different
      const res = await fetch('https://api.cloudinary.com/v1_1/dnlatyl5z/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) uploadedUrls.push(data.secure_url);
    }
    setImages(prev => [...prev, ...uploadedUrls]);
  };

  // Sort datasets and papers by createdAt descending
  const sortedDatasets = [...datasets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const sortedPapers = [...papers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

        {/* Tabs for Datasets and Research Papers */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex justify-between mb-6">
            <TabsTrigger value="datasets" className="w-1/2">Datasets ({datasets.length})</TabsTrigger>
            <TabsTrigger value="papers" className="w-1/2">Research Papers ({papers.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="datasets">
            {/* Only show Create Dataset form and dataset list here */}
            <div className="mb-8">
                    <Button onClick={() => setShowDatasetForm(true)} className="bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl hover:bg-emerald-800">
                      + Add Dataset
                    </Button>
                  </div>
            {showDatasetForm && (
              <Card className="my-8 max-w-4xl mx-auto p-8 shadow-lg border border-gray-200">
                <CardHeader>
                  <CardTitle>Create New Dataset</CardTitle>
                  <CardDescription>Fill out the form below to create a new dataset. Only metadata and a download URL are required.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateDataset} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block font-medium mb-1">Title</label>
                        <Input name="title" value={datasetForm.title} onChange={handleDatasetInput} required />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Category</label>
                        <select name="category" value={datasetForm.category} onChange={handleDatasetInput} required className="w-full border rounded px-2 py-1">
                          <option value="">Select Category</option>
                          {THREAT_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Description</label>
                        <Input name="description" value={datasetForm.description} onChange={handleDatasetInput} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block font-medium mb-1">Download URL</label>
                        <Input name="downloadUrl" value={datasetForm.downloadUrl} onChange={handleDatasetInput} required placeholder="https://..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-3">
                        <label className="block font-medium mb-1">Tags</label>
                        {datasetForm.tags.map((tag, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input value={tag} onChange={e => handleDatasetTagChange(idx, e.target.value)} placeholder="Tag" required />
                            {datasetForm.tags.length > 1 && <Button type="button" variant="destructive" onClick={() => removeDatasetTag(idx)}>-</Button>}
                            {idx === datasetForm.tags.length - 1 && <Button type="button" onClick={addDatasetTag}>+</Button>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-3">
                        <label className="block font-medium mb-1">Research Type</label>
                        <Input name="researchType" value={datasetForm.researchType} onChange={handleDatasetInput} />
                      </div>
                    </div>
                    {/* 1. Add state for projects */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-3">
                        <label className="block font-medium mb-1">Related Project</label>
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={projectSearch}
                          onChange={e => setProjectSearch(e.target.value)}
                          className="w-full border rounded px-2 py-1 mb-2"
                        />
                        <select
                          className="w-full border rounded px-2 py-1"
                          value={datasetForm.relatedProject}
                          onChange={e => setDatasetForm(prev => ({ ...prev, relatedProject: e.target.value }))}
                        >
                          <option value="">None</option>
                          {projects
                            .filter(p =>
                              p.title.toLowerCase().includes(projectSearch.toLowerCase())
                            )
                            .map(p => (
                              <option key={p._id} value={p._id}>{p.title}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                    {datasetCreateError && <div className="text-red-600">{datasetCreateError}</div>}
                    {datasetCreateSuccess && <div className="text-green-600">Dataset created successfully!</div>}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isCreatingDataset} className="py-4 bg-emerald-700 text-white font-extrabold text-lg uppercase tracking-wider rounded-xl hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600 focus:ring-offset-2 transition duration-300 ease-in-out shadow-2xl transform hover:scale-105">
                        {isCreatingDataset ? 'Creating...' : 'Create Dataset'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setShowDatasetForm(false)} className="py-4 font-bold text-lg rounded-xl">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            {/* List of datasets, using sortedDatasets */}
            {sortedDatasets.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <Database className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>No datasets found</p>
                    <p className="text-sm">
                      Try adjusting your search filters to find relevant datasets.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                {sortedDatasets.map((dataset) => (
                      <Card key={dataset._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            {dataset.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {dataset.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                        <span className="badge outline flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {dataset.location.name}
                        </span>
                        <span className="badge outline flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Published: {dataset.createdAt ? new Date(dataset.createdAt).toLocaleString() : 'N/A'}
                        </span>
                            {typeof dataset.downloads === 'number' && (
                          <span className="badge outline flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {dataset.downloads.toLocaleString()} Downloads
                          </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dataset.tags.map((tag) => (
                          <span key={tag} className="badge secondary text-xs">
                                {tag}
                          </span>
                            ))}
                          </div>
                          {dataset.featured && (
                        <span className="badge default bg-yellow-500 text-white flex items-center gap-1 mt-2">
                              <Star className="h-3 w-3 fill-current" /> Featured
                        </span>
                          )}
                          <Button asChild size="sm" className="mt-3">
                            <Link to={`/datasets/${dataset._id}`}>View Details</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
          </TabsContent>
          <TabsContent value="papers">
            {/* Only show Publish Completed Research Paper form and paper list here */}
            <div className="mb-8">
              <Button onClick={() => setShowPaperForm(true)} className="bg-blue-700 text-white font-bold px-6 py-2 rounded-xl hover:bg-blue-800">
                + Publish Research Paper
                          </Button>
                  </div>
            {showPaperForm && (
          <Card className="my-8 max-w-4xl mx-auto p-8 shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle>Publish Completed Research Paper</CardTitle>
              <CardDescription>Fill out the form below to publish your completed research as a conservation project publication.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublish} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Title</label>
                    <Input name="title" value={publicationForm.title} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Organization</label>
                    <Input name="organization" value={publicationForm.organization} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <Input name="description" value={publicationForm.description} onChange={handlePublicationInput} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Location</label>
                        <Input name="location" value={publicationForm.location.name} onChange={e => handleLocationChange('name', e.target.value)} required placeholder="e.g., Nyungwe National Park" />
                  </div>
                  <div>
                        <label className="block font-medium mb-1">Abstract</label>
                        <Input name="abstract" value={publicationForm.abstract} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Category</label>
                    <select name="category" value={publicationForm.category} onChange={handlePublicationInput} required className="w-full border rounded px-2 py-1">
                      <option value="">Select Category</option>
                      {THREAT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Publication Date</label>
                    <Input name="publicationDate" type="date" value={publicationForm.publicationDate} onChange={handlePublicationInput} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Trees Planted</label>
                    <Input type="number" min={0} value={impact.treesPlanted} onChange={e => setImpact({ ...impact, treesPlanted: Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Wildlife Protected</label>
                    <Input type="number" min={0} value={impact.wildlifeProtected} onChange={e => setImpact({ ...impact, wildlifeProtected: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Area Restored</label>
                    <Input type="number" min={0} value={impact.areaRestored} onChange={e => setImpact({ ...impact, areaRestored: Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">DOI</label>
                    <Input name="doi" value={publicationForm.doi || ''} onChange={handlePublicationInput} placeholder="DOI" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Methodology</label>
                    <Input name="methodology" value={publicationForm.methodology || ''} onChange={handlePublicationInput} placeholder="Methodology" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="w-full">
                  <label className="block font-medium mb-1">Associated Datasets</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 mb-2"
                    placeholder="Search datasets by title, category, or tag..."
                    value={datasetSearchTerm || ''}
                    onChange={e => setDatasetSearchTerm(e.target.value)}
                  />
                  {datasetsList.length === 0 ? (
                    <div className="text-gray-500 text-sm mb-2">No datasets available. Go and create dataset first.</div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        className="w-full border rounded px-2 py-1"
                        multiple
                        value={selectedDatasets}
                        onChange={e => {
                          const options = Array.from(e.target.selectedOptions).map(o => o.value);
                          setSelectedDatasets(Array.from(new Set(options)));
                        }}
                        size={Math.min(6, datasetsList.length)}
                      >
                        {datasetsList
                          .filter(ds =>
                            ds.title.toLowerCase().includes(datasetSearchTerm.toLowerCase()) ||
                            ds.category.toLowerCase().includes(datasetSearchTerm.toLowerCase()) ||
                            ds.tags.some(tag => tag.toLowerCase().includes(datasetSearchTerm.toLowerCase()))
                          )
                          .map(ds => (
                            <option key={ds._id} value={ds._id} disabled={selectedDatasets.includes(ds._id)}>
                              {ds.title} ({ds.category})
                            </option>
                          ))}
                      </select>
                      <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple datasets.</div>
                    </div>
                  )}
                </div>
                    {/* References */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">References</label>
                      {references.map((ref, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={ref} onChange={e => handleReferenceChange(idx, e.target.value)} placeholder="Reference" />
                          {references.length > 1 && <Button type="button" variant="destructive" onClick={() => removeReference(idx)}>-</Button>}
                          {idx === references.length - 1 && <Button type="button" onClick={addReference}>+</Button>}
                  </div>
                      ))}
                  </div>
                    {/* Keywords */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Keywords</label>
                      {keywords.map((kw, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={kw} onChange={e => handleKeywordChange(idx, e.target.value)} placeholder="Keyword" />
                          {keywords.length > 1 && <Button type="button" variant="destructive" onClick={() => removeKeyword(idx)}>-</Button>}
                          {idx === keywords.length - 1 && <Button type="button" onClick={addKeyword}>+</Button>}
                </div>
                      ))}
                  </div>
                    {/* Supplementary Files */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Supplementary Files</label>
                      {supplementaryFiles.map((file, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={file} onChange={e => handleSupplementaryFileChange(idx, e.target.value)} placeholder="Supplementary File" />
                          {supplementaryFiles.length > 1 && <Button type="button" variant="destructive" onClick={() => removeSupplementaryFile(idx)}>-</Button>}
                          {idx === supplementaryFiles.length - 1 && <Button type="button" onClick={addSupplementaryFile}>+</Button>}
                  </div>
                      ))}
                  </div>
                    {/* Objectives */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Objectives</label>
                      {objectives.map((obj, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={obj} onChange={e => handleObjectiveChange(idx, e.target.value)} placeholder="Objective" />
                          {objectives.length > 1 && <Button type="button" variant="destructive" onClick={() => removeObjective(idx)}>-</Button>}
                          {idx === objectives.length - 1 && <Button type="button" onClick={addObjective}>+</Button>}
                </div>
                      ))}
                    </div>
                    {/* Location (name, lat, lng) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Location Name</label>
                        <Input name="locationName" value={publicationForm.location.name} onChange={e => handleLocationChange('name', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Latitude</label>
                        <Input name="locationLat" value={publicationForm.location.lat} onChange={e => handleLocationChange('lat', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Longitude</label>
                        <Input name="locationLng" value={publicationForm.location.lng} onChange={e => handleLocationChange('lng', e.target.value)} required />
                  </div>
                </div>
                    {/* Tags */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Tags</label>
                      {tags.map((tag, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={tag} onChange={e => handleTagChange(idx, e.target.value)} placeholder="Tag" />
                          {tags.length > 1 && <Button type="button" variant="destructive" onClick={() => removeTag(idx)}>-</Button>}
                          {idx === tags.length - 1 && <Button type="button" onClick={addTag}>+</Button>}
                        </div>
                      ))}
                    </div>
                    {/* Status */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Status</label>
                      <select name="status" value={publicationForm.status} onChange={handlePublicationInput} className="w-full border rounded px-2 py-1">
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                    </div>
                    {/* Publication Links */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Publication Links</label>
                      {publicationLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={link} onChange={e => handlePublicationLinkChange(idx, e.target.value)} placeholder="Publication Link" />
                          {publicationLinks.length > 1 && <Button type="button" variant="destructive" onClick={() => removePublicationLink(idx)}>-</Button>}
                          {idx === publicationLinks.length - 1 && <Button type="button" onClick={addPublicationLink}>+</Button>}
                        </div>
                      ))}
                    </div>
                    {/* Budget */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                        <label className="block font-medium mb-1">Budget Total</label>
                        <Input name="budgetTotal" value={publicationForm.budget.total} onChange={e => handleBudgetChange('total', e.target.value)} />
                  </div>
                      <div>
                        <label className="block font-medium mb-1">Budget Spent</label>
                        <Input name="budgetSpent" value={publicationForm.budget.spent} onChange={e => handleBudgetChange('spent', e.target.value)} />
                </div>
                      <div>
                        <label className="block font-medium mb-1">Currency</label>
                        <select name="currency" value={publicationForm.budget.currency} onChange={e => handleBudgetChange('currency', e.target.value)} required className="w-full border rounded px-2 py-1">
                          <option value="RWF">RWF</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="KES">KES</option>
                          <option value="TZS">TZS</option>
                          <option value="UGX">UGX</option>
                          <option value="ZAR">ZAR</option>
                          <option value="CNY">CNY</option>
                          <option value="INR">INR</option>
                        </select>
                      </div>
                    </div>
                    {/* Images (Cloudinary upload) */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Images</label>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {images.map((img, idx) => (
                          <img key={idx} src={img} alt="Uploaded" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
                    {/* Team Members */}
                    <div className="w-full">
                      <label className="block font-medium mb-1">Team Members</label>
                      {teamMembers.map((member, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input value={member.name} onChange={e => handleTeamMemberChange(idx, 'name', e.target.value)} placeholder="Name" />
                          <Input type="email" value={member.email} onChange={e => handleTeamMemberChange(idx, 'email', e.target.value)} required pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" placeholder="Email" />
                          <Input value={member.role} onChange={e => handleTeamMemberChange(idx, 'role', e.target.value)} placeholder="Role" />
                          {teamMembers.length > 1 && <Button type="button" variant="destructive" onClick={() => removeTeamMember(idx)}>-</Button>}
                          {idx === teamMembers.length - 1 && <Button type="button" onClick={addTeamMember}>+</Button>}
                        </div>
                      ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block font-medium mb-1">Start Date</label>
                        <Input name="startDate" type="date" value={publicationForm.startDate} onChange={handlePublicationInput} required />
                  </div>
                      <div>
                        <label className="block font-medium mb-1">End Date</label>
                        <Input name="endDate" type="date" value={publicationForm.endDate} onChange={handlePublicationInput} required />
                </div>
                      <div></div>
                </div>
                    <Button type="submit" disabled={isPublishing} className="py-4 bg-blue-700 text-white font-extrabold text-lg uppercase tracking-wider rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 transition duration-300 ease-in-out shadow-2xl transform hover:scale-105">
                      {isPublishing ? 'Publishing...' : 'Publish Research Paper'}
                    </Button>
              </form>
            </CardContent>
          </Card>
        )}
            {/* List of research papers, using sortedPapers */}
            {sortedPapers.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p>No research papers found</p>
                    <p className="text-sm">
                      Try adjusting your search filters to find relevant papers.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sortedPapers.map((paper) => (
                      <Card key={paper._id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-medium">
                            {paper.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                      {paper.description && (
                        <p className="text-gray-700 mb-2">{paper.description}</p>
                      )}
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                        {/* Authors badge: Only render if authors exist or ownerEmail exists */}
                        {(paper.authors && paper.authors.length > 0) || paper.ownerEmail ? (
                          <span className="badge outline flex items-center gap-1">
                              <Users className="h-3 w-3" />
                            Authors: {paper.authors && paper.authors.length > 0
                              ? `${paper.authors.join(", ")} (${paper.ownerEmail || "N/A"})`
                              : paper.ownerEmail}
                          </span>
                        ) : null}
                        <span className="badge outline flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Published: {paper.createdAt ? new Date(paper.createdAt).toLocaleString() : 'N/A'}
                        </span>
                            {typeof paper.downloads === 'number' && (
                          <span className="badge outline flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {paper.downloads.toLocaleString()} Downloads
                          </span>
                            )}
                          </div>
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
          </TabsContent>
        </Tabs>

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
                  <div><b>Access Level:</b> {selectedDataset.accessLevel ? selectedDataset.accessLevel.replace('_', ' ') : ''}</div>
                  <div><b>Published:</b> {selectedDataset.createdAt ? new Date(selectedDataset.createdAt).toLocaleString() : 'N/A'}</div>
                  {Array.isArray(selectedDataset.owners) && selectedDataset.owners.length > 0 && (
                    <div><b>Publishers:</b> {selectedDataset.owners.map(o => o?.name).filter(Boolean).join(', ')}</div>
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
                      placeholder="Message to publishers (optional)"
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
                  <div><b>Access Level:</b> {selectedPaper.accessLevel}</div>
                  <div><b>Published:</b> {selectedPaper.createdAt ? new Date(selectedPaper.createdAt).toLocaleString() : 'N/A'}</div>
                  <div><b>References:</b> {selectedPaper.references?.join(', ')}</div>
                  <div><b>Keywords:</b> {selectedPaper.keywords?.join(', ')}</div>
                  <div><b>Supplementary Files:</b> {selectedPaper.supplementaryFiles?.join(', ')}</div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}
