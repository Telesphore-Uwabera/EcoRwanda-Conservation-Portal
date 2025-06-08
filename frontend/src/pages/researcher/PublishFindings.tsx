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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";

export default function PublishFindings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleFileUpload = (
    type: "dataset" | "publication",
    files: FileList,
  ) => {
    const fileArray = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    if (type === "dataset") {
      setDatasets((prev) => [...prev, ...fileArray]);
    } else {
      setPublications((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (type: "dataset" | "publication", id: number) => {
    if (type === "dataset") {
      setDatasets((prev) => prev.filter((f) => f.id !== id));
    } else {
      setPublications((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const findingsData = {
        ...formData,
        datasets,
        publications,
        author: user?.name,
        authorId: user?.id,
        submittedAt: new Date().toISOString(),
        status: "under_review",
      };

      if (isOnline) {
        // Simulate API submission
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Research findings submitted:", findingsData);
      } else {
        // Store offline
        console.log("Research findings stored offline:", findingsData);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard/researcher");
      }, 3000);
    } catch (error) {
      console.error("Error submitting findings:", error);
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-4xl space-y-6">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Publish Research Findings
          </h1>
          <p className="text-gray-600">
            Share your research findings with the conservation community and
            contribute to Rwanda's scientific knowledge base
          </p>
        </div>

        {success && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Your research findings have been submitted for review! You'll be
              notified once the peer review process is complete.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="content">Research Content</TabsTrigger>
              <TabsTrigger value="data">Data & Files</TabsTrigger>
              <TabsTrigger value="review">Review & Submit</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Provide the fundamental details about your research study
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Research Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter a descriptive title for your research"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Research Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select research category" />
                        </SelectTrigger>
                        <SelectContent>
                          {researchCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </div>
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select study location" />
                        </SelectTrigger>
                        <SelectContent>
                          {rwandaEcosystems.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Study Period Start</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.studyPeriod.start}
                        onChange={(e) =>
                          handleInputChange("studyPeriod.start", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">Study Period End</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.studyPeriod.end}
                        onChange={(e) =>
                          handleInputChange("studyPeriod.end", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abstract">Abstract</Label>
                    <Textarea
                      id="abstract"
                      value={formData.abstract}
                      onChange={(e) =>
                        handleInputChange("abstract", e.target.value)
                      }
                      placeholder="Provide a concise summary of your research objectives, methodology, key findings, and implications"
                      rows={6}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      {formData.abstract.length}/500 characters recommended
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Keywords</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Add keywords (e.g., gorilla, conservation, ecosystem)"
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addKeyword())
                        }
                      />
                      <Button
                        type="button"
                        onClick={addKeyword}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Research Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-600" />
                    Research Content
                  </CardTitle>
                  <CardDescription>
                    Detail your methodology, findings, and implications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Textarea
                      id="methodology"
                      value={formData.methodology}
                      onChange={(e) =>
                        handleInputChange("methodology", e.target.value)
                      }
                      placeholder="Describe your research methodology, data collection methods, and analytical approaches"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="findings">Key Findings</Label>
                    <Textarea
                      id="findings"
                      value={formData.findings}
                      onChange={(e) =>
                        handleInputChange("findings", e.target.value)
                      }
                      placeholder="Present your main research findings and results"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="implications">
                      Conservation Implications
                    </Label>
                    <Textarea
                      id="implications"
                      value={formData.implications}
                      onChange={(e) =>
                        handleInputChange("implications", e.target.value)
                      }
                      placeholder="Discuss the conservation implications and potential applications of your findings"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fundingSource">
                      Funding Source (Optional)
                    </Label>
                    <Input
                      id="fundingSource"
                      value={formData.fundingSource}
                      onChange={(e) =>
                        handleInputChange("fundingSource", e.target.value)
                      }
                      placeholder="Name of funding organization or grant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ethicalApproval">
                      Ethical Approval (Optional)
                    </Label>
                    <Input
                      id="ethicalApproval"
                      value={formData.ethicalApproval}
                      onChange={(e) =>
                        handleInputChange("ethicalApproval", e.target.value)
                      }
                      placeholder="Ethics committee approval reference"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acknowledgments">
                      Acknowledgments (Optional)
                    </Label>
                    <Textarea
                      id="acknowledgments"
                      value={formData.acknowledgments}
                      onChange={(e) =>
                        handleInputChange("acknowledgments", e.target.value)
                      }
                      placeholder="Acknowledge contributors, reviewers, and supporters"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Collaborators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Collaborators
                  </CardTitle>
                  <CardDescription>
                    Add co-authors and collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Name"
                      value={newCollaborator.name}
                      onChange={(e) =>
                        setNewCollaborator((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Affiliation"
                      value={newCollaborator.affiliation}
                      onChange={(e) =>
                        setNewCollaborator((prev) => ({
                          ...prev,
                          affiliation: e.target.value,
                        }))
                      }
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Role (Optional)"
                        value={newCollaborator.role}
                        onChange={(e) =>
                          setNewCollaborator((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        onClick={addCollaborator}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.collaborators.length > 0 && (
                    <div className="space-y-2">
                      {formData.collaborators.map((collaborator, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{collaborator.name}</p>
                            <p className="text-sm text-gray-600">
                              {collaborator.affiliation}
                              {collaborator.role && ` • ${collaborator.role}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCollaborator(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data & Files Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-amber-600" />
                    Supporting Data & Documents
                  </CardTitle>
                  <CardDescription>
                    Upload datasets, supplementary materials, and publications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dataset Upload */}
                  <div className="space-y-4">
                    <Label>Research Datasets</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload CSV, Excel, or other data files
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls,.json,.txt"
                        onChange={(e) =>
                          e.target.files &&
                          handleFileUpload("dataset", e.target.files)
                        }
                        className="hidden"
                        id="dataset-upload"
                      />
                      <label htmlFor="dataset-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Dataset Files
                        </Button>
                      </label>
                    </div>

                    {datasets.length > 0 && (
                      <div className="space-y-2">
                        {datasets.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Database className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("dataset", file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Publication Upload */}
                  <div className="space-y-4">
                    <Label>Publications & Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload PDF documents, papers, or reports
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          e.target.files &&
                          handleFileUpload("publication", e.target.files)
                        }
                        className="hidden"
                        id="publication-upload"
                      />
                      <label htmlFor="publication-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Documents
                        </Button>
                      </label>
                    </div>

                    {publications.length > 0 && (
                      <div className="space-y-2">
                        {publications.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-emerald-600" />
                              <div>
                                <p className="font-medium text-sm">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile("publication", file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Data Availability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Data Availability</Label>
                      <Select
                        value={formData.dataAvailability}
                        onValueChange={(value) =>
                          handleInputChange("dataAvailability", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Openly Available</SelectItem>
                          <SelectItem value="restricted">
                            Restricted Access
                          </SelectItem>
                          <SelectItem value="upon_request">
                            Available Upon Request
                          </SelectItem>
                          <SelectItem value="confidential">
                            Confidential
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>License</Label>
                      <Select
                        value={formData.license}
                        onValueChange={(value) =>
                          handleInputChange("license", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {licenseTypes.map((license) => (
                            <SelectItem
                              key={license.value}
                              value={license.value}
                            >
                              <div>
                                <div className="font-medium">
                                  {license.label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {license.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review & Submit Tab */}
            <TabsContent value="review" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>
                    Review your submission before publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {formData.title || "Untitled Research"}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Category:</span>{" "}
                          {formData.category || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {formData.location || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Study Period:</span>
                          {formData.studyPeriod.start &&
                          formData.studyPeriod.end
                            ? ` ${formData.studyPeriod.start} to ${formData.studyPeriod.end}`
                            : " Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Keywords:</span>{" "}
                          {formData.keywords.length} keywords
                        </div>
                      </div>
                      {formData.abstract && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Abstract:</span>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-3">
                            {formData.abstract}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-medium text-blue-900">
                          {datasets.length}
                        </p>
                        <p className="text-sm text-blue-700">Datasets</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                        <p className="font-medium text-emerald-900">
                          {publications.length}
                        </p>
                        <p className="text-sm text-emerald-700">Documents</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="font-medium text-purple-900">
                          {formData.collaborators.length + 1}
                        </p>
                        <p className="text-sm text-purple-700">Authors</p>
                      </div>
                    </div>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        Your research will undergo peer review before
                        publication. You'll receive notifications about the
                        review status and any required revisions.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/dashboard/researcher")}
                      disabled={isSubmitting}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={
                        isSubmitting ||
                        !formData.title ||
                        !formData.abstract ||
                        !formData.methodology ||
                        !formData.findings
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting for Review...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Submit for Review
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </DashboardLayout>
  );
}
