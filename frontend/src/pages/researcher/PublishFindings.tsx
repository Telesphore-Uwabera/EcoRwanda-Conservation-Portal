import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen,
  Upload,
  FileText,
  Image,
  Database,
  Globe,
  CheckCircle,
  X,
  Plus,
  Calendar,
  MapPin,
  Users,
  Award,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const tabTitles: Record<string, string> = {
  basic: "Basic Information",
  content: "Research Content",
  files: "Data & Files",
  review: "Review & Submit",
};

export default function PublishFindings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: [],
    category: "",
    methodology: "",
    findings: "",
    implications: "",
    acknowledgments: "",
    location: "",
    studyPeriod: {
      start: "",
      end: "",
    },
    collaborators: [],
    fundingSource: "",
    ethicalApproval: "",
    dataAvailability: "restricted",
    license: "cc-by",
  });

  const [datasets, setDatasets] = useState([]);
  const [publications, setPublications] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newCollaborator, setNewCollaborator] = useState({
    name: "",
    affiliation: "",
    role: "",
  });

  const [newDatasetLink, setNewDatasetLink] = useState("");
  const [newDatasetType, setNewDatasetType] = useState("");
  const [datasetLinks, setDatasetLinks] = useState([]);
  const [newPublicationLink, setNewPublicationLink] = useState("");
  const [newPublicationType, setNewPublicationType] = useState("");
  const [publicationLinks, setPublicationLinks] = useState([]);

  const researchCategories = [
    { value: "biodiversity", label: "Biodiversity Conservation", icon: "🌿" },
    { value: "wildlife_behavior", label: "Wildlife Behavior", icon: "🦁" },
    { value: "ecosystem_health", label: "Ecosystem Health", icon: "🌍" },
    { value: "climate_impact", label: "Climate Impact", icon: "🌡️" },
    {
      value: "human_wildlife_interaction",
      label: "Human-Wildlife Interaction",
      icon: "🤝",
    },
    { value: "conservation_policy", label: "Conservation Policy", icon: "📋" },
    { value: "species_monitoring", label: "Species Monitoring", icon: "📊" },
    { value: "habitat_restoration", label: "Habitat Restoration", icon: "🌳" },
  ];

  const rwandaEcosystems = [
    "Volcanoes National Park",
    "Nyungwe National Park",
    "Akagera National Park",
    "Gishwati-Mukura National Park",
    "Lake Kivu",
    "Lake Muhazi",
    "Rwandan Highlands",
    "Central Plateau",
    "Eastern Savanna",
    "Multiple Ecosystems",
  ];

  const licenseTypes = [
    {
      value: "cc-by",
      label: "CC BY - Attribution",
      description: "Allows any use with attribution",
    },
    {
      value: "cc-by-sa",
      label: "CC BY-SA - Attribution-ShareAlike",
      description: "Share with same license",
    },
    {
      value: "cc-by-nc",
      label: "CC BY-NC - Attribution-NonCommercial",
      description: "Non-commercial use only",
    },
    {
      value: "all-rights-reserved",
      label: "All Rights Reserved",
      description: "Traditional copyright",
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("studyPeriod.")) {
      const periodField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        studyPeriod: {
          ...prev.studyPeriod,
          [periodField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const addCollaborator = () => {
    if (newCollaborator.name.trim() && newCollaborator.affiliation.trim()) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, { ...newCollaborator }],
      }));
      setNewCollaborator({ name: "", affiliation: "", role: "" });
    }
  };

  const removeCollaborator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index),
    }));
  };

  const uploadFileToFirebase = async (file: File, folder: string) => {
    try {
      const fileRef = storageRef(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error('Firebase upload error:', err);
      throw err;
    }
  };

  const handleFileUpload = (
    type: 'dataset' | 'publication',
    files: FileList,
  ) => {
    const fileArray = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));
    if (type === 'dataset') {
      setDatasets((prev) => [...prev, ...fileArray]);
    } else {
      setPublications((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (type: 'dataset' | 'publication', id: number) => {
    if (type === 'dataset') {
      setDatasets((prev) => prev.filter((f) => f.id !== id));
    } else {
      setPublications((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Require only main fields and at least one dataset/publication link
      if (!formData.title || !formData.abstract || !formData.category || !formData.methodology || !formData.findings || !formData.implications || !formData.acknowledgments || !formData.location || !formData.studyPeriod.start || !formData.studyPeriod.end || !formData.dataAvailability || !formData.license || datasetLinks.length === 0 || publicationLinks.length === 0) {
        alert("Please fill in all main fields, add at least one dataset link, and at least one publication link.");
        setIsSubmitting(false);
        setUploading(false);
        return;
      }

      // Prepare payload with links and types
      const payload = {
        title: formData.title,
        abstract: formData.abstract,
        category: formData.category,
        methodology: formData.methodology,
        findings: formData.findings,
        implications: formData.implications,
        acknowledgments: formData.acknowledgments,
        location: JSON.stringify(formData.location),
        studyPeriod: JSON.stringify(formData.studyPeriod),
        keywords: JSON.stringify(formData.keywords),
        collaborators: JSON.stringify(formData.collaborators),
        fundingSource: formData.fundingSource,
        ethicalApproval: formData.ethicalApproval,
        dataAvailability: formData.dataAvailability,
        license: formData.license,
        datasetLinks: JSON.stringify(datasetLinks),
        publicationLinks: JSON.stringify(publicationLinks),
      };

      // Add auth token if needed
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }

      const response = await fetch("/api/researchprojects/publish", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to publish finding");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/researcher");
      }, 3000);
    } catch (error) {
      console.error("Error submitting findings:", error);
      alert("Error submitting findings: " + (error && error.message ? error.message : error));
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <DashboardLayout>
      {success && (
        <Alert variant="default" className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Research findings submitted successfully.
          </AlertDescription>
        </Alert>
      )}
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Publish New Research Findings
          </h1>
          <p className="text-gray-600">
            Submit new research papers, datasets, and publications for review and dissemination
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Responsive tab title for small screens */}
          <h2 className="block sm:hidden text-xl font-bold mb-4 text-center">
            {tabTitles[activeTab]}
          </h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="hidden sm:grid w-full sm:grid-cols-2 md:grid-cols-4 p-0 bg-transparent">
              <TabsTrigger className="w-full border-2 border-green-500 rounded-lg hover:bg-green-50 hover:border-green-700 transition-colors" value="basic">Basic Information</TabsTrigger>
              <TabsTrigger className="w-full border-2 border-green-500 rounded-lg hover:bg-green-50 hover:border-green-700 transition-colors" value="content">Research Content</TabsTrigger>
              <TabsTrigger className="w-full border-2 border-green-500 rounded-lg hover:bg-green-50 hover:border-green-700 transition-colors" value="files">Data & Files</TabsTrigger>
              <TabsTrigger className="w-full border-2 border-green-500 rounded-lg hover:bg-green-50 hover:border-green-700 transition-colors" value="review">Review & Submit</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the fundamental details about your research study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Research Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter a descriptive title for your research"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Research Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select research category" />
                        </SelectTrigger>
                        <SelectContent>
                          {researchCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Study Location</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) =>
                          handleInputChange("location", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select study location" />
                        </SelectTrigger>
                        <SelectContent>
                          {rwandaEcosystems.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studyPeriodStart">Study Period Start</Label>
                      <Input
                        id="studyPeriodStart"
                        type="date"
                        value={formData.studyPeriod.start}
                        onChange={(e) =>
                          handleInputChange("studyPeriod.start", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studyPeriodEnd">Study Period End</Label>
                      <Input
                        id="studyPeriodEnd"
                        type="date"
                        value={formData.studyPeriod.end}
                        onChange={(e) =>
                          handleInputChange("studyPeriod.end", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abstract">Abstract</Label>
                    <Textarea
                      id="abstract"
                      placeholder="Provide a concise summary of your research objectives, key findings, and implications"
                      value={formData.abstract}
                      onChange={(e) =>
                        handleInputChange("abstract", e.target.value)
                      }
                      className="min-h-[120px] w-full"
                    />
                    <p className="text-sm text-gray-500">
                      {formData.abstract.length}/500 characters recommended
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="newKeyword"
                        placeholder="Add keywords (e.g., gorilla, conservation, ecosystem)"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addKeyword}>
                        <Plus className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          {keyword}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKeyword(keyword)}
                            className="h-5 w-5 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("content")}>
                  Next: Research Content <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Research Content Tab */}
            <TabsContent value="content" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Content</CardTitle>
                  <CardDescription>
                    Detail your research methodology, findings, and implications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Textarea
                      id="methodology"
                      placeholder="Describe the methods used in your research"
                      value={formData.methodology}
                      onChange={(e) =>
                        handleInputChange("methodology", e.target.value)
                      }
                      className="min-h-[150px] w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="findings">Findings</Label>
                    <Textarea
                      id="findings"
                      placeholder="Summarize your key findings and results"
                      value={formData.findings}
                      onChange={(e) =>
                        handleInputChange("findings", e.target.value)
                      }
                      className="min-h-[150px] w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="implications">Implications & Discussion</Label>
                    <Textarea
                      id="implications"
                      placeholder="Discuss the implications of your findings and future research directions"
                      value={formData.implications}
                      onChange={(e) =>
                        handleInputChange("implications", e.target.value)
                      }
                      className="min-h-[150px] w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acknowledgments">Acknowledgments</Label>
                    <Textarea
                      id="acknowledgments"
                      placeholder="Acknowledge individuals, organizations, or funding sources"
                      value={formData.acknowledgments}
                      onChange={(e) =>
                        handleInputChange("acknowledgments", e.target.value)
                      }
                      className="min-h-[100px] w-full"
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button onClick={() => setActiveTab("basic")} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous: Basic
                  Information
                </Button>
                <Button onClick={() => setActiveTab("files")}>
                  Next: Data & Files <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Data & Files Tab */}
            <TabsContent value="files" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data & Files</CardTitle>
                  <CardDescription>
                    Upload relevant datasets and publications related to your study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataAvailability">Data Availability</Label>
                    <Select
                      value={formData.dataAvailability}
                      onValueChange={(value) =>
                        handleInputChange("dataAvailability", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select data availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open Access</SelectItem>
                        <SelectItem value="restricted">Restricted Access</SelectItem>
                        <SelectItem value="upon_request">Upon Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">License</Label>
                    <Select
                      value={formData.license}
                      onValueChange={(value) => handleInputChange("license", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenseTypes.map((license) => (
                          <SelectItem key={license.value} value={license.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {license.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {license.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Datasets</h3>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="datasetLinkInput"
                        type="text"
                        placeholder="Paste dataset link and press Enter"
                        value={newDatasetLink || ''}
                        onChange={e => setNewDatasetLink(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newDatasetLink.trim()) {
                            setDatasetLinks(prev => [...prev, newDatasetLink.trim()]);
                            setNewDatasetLink('');
                          }
                        }}
                        className="flex-1"
                      />
                        <ul className="space-y-2">
                        {datasetLinks.map((link, idx) => (
                          <li key={idx} className="flex items-center justify-between p-2 border rounded-md">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link}</a>
                            <Button variant="ghost" size="sm" onClick={() => setDatasetLinks(datasetLinks.filter((_, i) => i !== idx))}>
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Publications</h3>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="publicationLinkInput"
                        type="text"
                        placeholder="Paste publication link and press Enter"
                        value={newPublicationLink || ''}
                        onChange={e => setNewPublicationLink(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newPublicationLink.trim()) {
                            setPublicationLinks(prev => [...prev, newPublicationLink.trim()]);
                            setNewPublicationLink('');
                          }
                        }}
                        className="flex-1"
                      />
                        <ul className="space-y-2">
                        {publicationLinks.map((link, idx) => (
                          <li key={idx} className="flex items-center justify-between p-2 border rounded-md">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link}</a>
                            <Button variant="ghost" size="sm" onClick={() => setPublicationLinks(publicationLinks.filter((_, i) => i !== idx))}>
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button onClick={() => setActiveTab("content")}
                  variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous: Research Content
                </Button>
                <Button onClick={() => setActiveTab("review")}>
                  Next: Review & Submit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Review & Submit Tab */}
            <TabsContent value="review" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Please review all the details before submitting your findings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Title:</p>
                      <p>{formData.title}</p>
                    </div>
                    <div>
                      <p className="font-medium">Category:</p>
                      <p>{researchCategories.find(cat => cat.value === formData.category)?.label || formData.category}</p>
                    </div>
                    <div>
                      <p className="font-medium">Location:</p>
                      <p>{formData.location}</p>
                    </div>
                    <div>
                      <p className="font-medium">Study Period:</p>
                      <p>{formData.studyPeriod.start} to {formData.studyPeriod.end}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium">Abstract:</p>
                      <p className="whitespace-pre-wrap">{formData.abstract}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium">Keywords:</p>
                      <p>{formData.keywords.join(", ") || "N/A"}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Research Content</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Methodology:</p>
                      <p className="whitespace-pre-wrap">{formData.methodology || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium">Findings:</p>
                      <p className="whitespace-pre-wrap">{formData.findings || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium">Implications & Discussion:</p>
                      <p className="whitespace-pre-wrap">{formData.implications || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium">Acknowledgments:</p>
                      <p className="whitespace-pre-wrap">{formData.acknowledgments || "N/A"}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Collaborators & Funding</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Collaborators:</p>
                      {formData.collaborators.length === 0 ? (
                        <p>N/A</p>
                      ) : (
                        <ul className="list-disc pl-5">
                          {formData.collaborators.map((collab, index) => (
                            <li key={index}>{collab.name} ({collab.affiliation}) - {collab.role}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Funding Source:</p>
                      <p>{formData.fundingSource || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-medium">Ethical Approval:</p>
                      <p>{formData.ethicalApproval || "N/A"}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Data & Licensing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Data Availability:</p>
                      <p>{formData.dataAvailability.replace("_", " ")}</p>
                    </div>
                    <div>
                      <p className="font-medium">License:</p>
                      <p>{licenseTypes.find(lic => lic.value === formData.license)?.label || formData.license}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium">Uploaded Datasets:</p>
                      {datasetLinks.length === 0 ? (
                        <p>No datasets added.</p>
                      ) : (
                        <ul className="list-disc pl-5">
                          {datasetLinks.map((link, idx) => (
                            <li key={idx}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link}</a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-medium">Uploaded Publications:</p>
                      {publicationLinks.length === 0 ? (
                        <p>No publications added.</p>
                      ) : (
                        <ul className="list-disc pl-5">
                          {publicationLinks.map((link, idx) => (
                            <li key={idx}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link}</a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <>Submit Findings <Upload className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </DashboardLayout>
  );
}
