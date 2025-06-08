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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Plus,
  X,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Award,
  Target,
  Loader2,
  MessageSquare,
  Star,
  UserPlus,
  Eye,
} from "lucide-react";

export default function RequestVolunteers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    location: "",
    duration: "",
    startDate: "",
    endDate: "",
    volunteersNeeded: 10,
    requiredSkills: [],
    preferredSkills: [],
    timeCommitment: "",
    difficultyLevel: "",
    compensation: "",
    trainingProvided: false,
    accommodationProvided: false,
    transportationProvided: false,
    contactInfo: user?.email || "",
    applicationDeadline: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState("required");

  // TODO: Fetch existing requests from MongoDB backend
  const existingRequests = [];

  const skillSuggestions = [
    "Species identification",
    "Data recording",
    "GPS navigation",
    "Photography",
    "Basic chemistry",
    "Field research",
    "Wildlife tracking",
    "Plant identification",
    "Water sampling",
    "Camera trap operation",
    "GIS mapping",
    "Statistical analysis",
    "Report writing",
    "Public speaking",
    "Teaching experience",
    "First aid certification",
    "Driving license",
    "Physical fitness",
    "Team leadership",
    "Local language skills",
  ];

  const rwandaLocations = [
    "Volcanoes National Park",
    "Nyungwe National Park",
    "Akagera National Park",
    "Gishwati-Mukura National Park",
    "Lake Kivu",
    "Lake Muhazi",
    "Kigali City",
    "Multiple locations",
    "Remote field sites",
  ];

  const difficultyLevels = [
    {
      value: "beginner",
      label: "Beginner",
      description: "No prior experience required",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Some experience preferred",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Significant experience required",
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const targetArray =
        skillType === "required" ? "requiredSkills" : "preferredSkills";
      if (!formData[targetArray].includes(newSkill.trim())) {
        setFormData((prev) => ({
          ...prev,
          [targetArray]: [...prev[targetArray], newSkill.trim()],
        }));
        setNewSkill("");
      }
    }
  };

  const removeSkill = (skill: string, type: "required" | "preferred") => {
    const targetArray =
      type === "required" ? "requiredSkills" : "preferredSkills";
    setFormData((prev) => ({
      ...prev,
      [targetArray]: prev[targetArray].filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        requesterId: user?.id,
        requesterName: user?.name,
        organization: user?.organization,
        status: "active",
        postedDate: new Date().toISOString(),
        volunteersApplied: 0,
        responses: 0,
      };

      if (isOnline) {
        // Simulate API submission
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Volunteer request submitted:", requestData);
      } else {
        // Store offline
        console.log("Volunteer request stored offline:", requestData);
      }

      setSuccess(true);

      setTimeout(() => {
        setActiveTab("existing");
        setFormData({
          title: "",
          description: "",
          objectives: "",
          location: "",
          duration: "",
          startDate: "",
          endDate: "",
          volunteersNeeded: 10,
          requiredSkills: [],
          preferredSkills: [],
          timeCommitment: "",
          difficultyLevel: "",
          compensation: "",
          trainingProvided: false,
          accommodationProvided: false,
          transportationProvided: false,
          contactInfo: user?.email || "",
          applicationDeadline: "",
        });
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting volunteer request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-amber-600" />
            Request Volunteer Assistance
          </h1>
          <p className="text-gray-600">
            Get help from Rwanda's volunteer conservation community for your
            research projects
          </p>
        </div>

        {success && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Your volunteer request has been posted successfully! Volunteers
              will be notified and can start applying.
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-2 px-1 font-medium ${
              activeTab === "create"
                ? "border-b-2 border-amber-600 text-amber-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create New Request
          </button>
          <button
            onClick={() => setActiveTab("existing")}
            className={`pb-2 px-1 font-medium ${
              activeTab === "existing"
                ? "border-b-2 border-amber-600 text-amber-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Requests (
            {existingRequests.filter((r) => r.status === "active").length})
          </button>
        </div>

        {/* Create New Request Tab */}
        {activeTab === "create" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Project Information
                </CardTitle>
                <CardDescription>
                  Provide details about your research project and volunteer
                  needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Give your project a clear, descriptive title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your research project, its goals, and how volunteers will contribute"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Specific Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={formData.objectives}
                    onChange={(e) =>
                      handleInputChange("objectives", e.target.value)
                    }
                    placeholder="List the specific tasks and objectives volunteers will help with"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) =>
                        handleInputChange("location", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project location" />
                      </SelectTrigger>
                      <SelectContent>
                        {rwandaLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volunteersNeeded">
                      Number of Volunteers Needed
                    </Label>
                    <Input
                      id="volunteersNeeded"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.volunteersNeeded}
                      onChange={(e) =>
                        handleInputChange(
                          "volunteersNeeded",
                          parseInt(e.target.value),
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline">
                      Application Deadline
                    </Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) =>
                        handleInputChange("applicationDeadline", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Volunteer Requirements
                </CardTitle>
                <CardDescription>
                  Specify the skills and requirements for volunteers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timeCommitment">Time Commitment</Label>
                    <Input
                      id="timeCommitment"
                      value={formData.timeCommitment}
                      onChange={(e) =>
                        handleInputChange("timeCommitment", e.target.value)
                      }
                      placeholder="e.g., 2-3 days per week, Full-time for 2 weeks"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                    <Select
                      value={formData.difficultyLevel}
                      onValueChange={(value) =>
                        handleInputChange("difficultyLevel", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <div className="font-medium">{level.label}</div>
                              <div className="text-xs text-gray-500">
                                {level.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex gap-2">
                      <Select value={skillType} onValueChange={setSkillType}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="preferred">Preferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill requirement"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {skillSuggestions.slice(0, 8).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            setNewSkill(skill);
                            addSkill();
                          }}
                          className="text-left p-2 rounded border border-gray-200 hover:bg-gray-50 text-xs"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(formData.requiredSkills.length > 0 ||
                    formData.preferredSkills.length > 0) && (
                    <div className="space-y-3">
                      {formData.requiredSkills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Required Skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.requiredSkills.map((skill) => (
                              <Badge
                                key={skill}
                                className="bg-red-100 text-red-800 flex items-center gap-1"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill, "required")}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.preferredSkills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Preferred Skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.preferredSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSkill(skill, "preferred")
                                  }
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Support & Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-emerald-600" />
                  Support & Benefits
                </CardTitle>
                <CardDescription>
                  What support and benefits will you provide to volunteers?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="training"
                      checked={formData.trainingProvided}
                      onCheckedChange={(checked) =>
                        handleInputChange("trainingProvided", checked)
                      }
                    />
                    <Label htmlFor="training">Training will be provided</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accommodation"
                      checked={formData.accommodationProvided}
                      onCheckedChange={(checked) =>
                        handleInputChange("accommodationProvided", checked)
                      }
                    />
                    <Label htmlFor="accommodation">
                      Accommodation will be provided
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportation"
                      checked={formData.transportationProvided}
                      onCheckedChange={(checked) =>
                        handleInputChange("transportationProvided", checked)
                      }
                    />
                    <Label htmlFor="transportation">
                      Transportation will be provided
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compensation">
                    Compensation & Benefits (Optional)
                  </Label>
                  <Textarea
                    id="compensation"
                    value={formData.compensation}
                    onChange={(e) =>
                      handleInputChange("compensation", e.target.value)
                    }
                    placeholder="Describe any compensation, stipends, meals, certificates, or other benefits"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  <Input
                    id="contactInfo"
                    type="email"
                    value={formData.contactInfo}
                    onChange={(e) =>
                      handleInputChange("contactInfo", e.target.value)
                    }
                    placeholder="Email for volunteer applications"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
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
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                disabled={
                  isSubmitting || !formData.title || !formData.description
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting Request...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Post Volunteer Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Existing Requests Tab */}
        {activeTab === "existing" && (
          <div className="space-y-6">
            {existingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No volunteer requests yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first volunteer request to get help with your
                    research projects
                  </p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {existingRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {request.title}
                            </h3>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>

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

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {request.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Posted {formatDate(request.postedDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Deadline {formatDate(request.deadline)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {request.responses} responses
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-medium text-emerald-600">
                              {request.volunteersApplied}
                            </span>
                            <span className="text-gray-600">
                              {" "}
                              / {request.volunteersNeeded} volunteers applied
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Applications
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
