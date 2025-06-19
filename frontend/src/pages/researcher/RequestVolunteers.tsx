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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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
        title: formData.title,
        description: formData.description,
        skillsRequired: formData.requiredSkills,
        location: typeof formData.location === 'string' ? { name: formData.location } : formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfVolunteersNeeded: formData.volunteersNeeded,
        // Add other fields as needed
      };

      // Add auth token if needed
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }

      const response = await fetch('/api/volunteer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to submit volunteer request');
      }

      setSuccess(true);
      setTimeout(() => {
        setActiveTab('existing');
        setFormData({
          title: '',
          description: '',
          objectives: '',
          location: '',
          duration: '',
          startDate: '',
          endDate: '',
          volunteersNeeded: 10,
          requiredSkills: [],
          preferredSkills: [],
          timeCommitment: '',
          difficultyLevel: '',
          compensation: '',
          trainingProvided: false,
          accommodationProvided: false,
          transportationProvided: false,
          contactInfo: user?.email || '',
          applicationDeadline: '',
        });
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting volunteer request:', error);
      alert('Error submitting volunteer request: ' + (error && error.message ? error.message : error));
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
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        {success ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Request submitted successfully! You'll be notified of applications.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              Request Volunteers
            </h1>
            <p className="text-gray-600">
              Post requests for volunteers to assist with your research projects
            </p>
          </div>
        )}

        {/* Form Steps */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create New Request</TabsTrigger>
            <TabsTrigger value="existing">My Requests ({existingRequests.length})</TabsTrigger>
          </TabsList>

          {/* Create New Request Tab */}
          <TabsContent value="create" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  Provide details about your research project and volunteer needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    placeholder="Give your project a clear, descriptive title"
                    value={formData.title}
                    onChange={(e) =>
                      handleInputChange("title", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="Describe your research project, its goals, and how volunteers will contribute"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="min-h-[100px] w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Specific Objectives</Label>
                  <Textarea
                    id="objectives"
                    placeholder="List the specific tasks and objectives volunteers will help with"
                    value={formData.objectives}
                    onChange={(e) =>
                      handleInputChange("objectives", e.target.value)
                    }
                    className="min-h-[80px] w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) =>
                        handleInputChange("location", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project location" />
                      </SelectTrigger>
                      <SelectContent>
                        {rwandaLocations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volunteersNeeded">Number of Volunteers Needed</Label>
                    <Input
                      id="volunteersNeeded"
                      type="number"
                      value={formData.volunteersNeeded}
                      onChange={(e) =>
                        handleInputChange("volunteersNeeded", parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="w-full"
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
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      handleInputChange("applicationDeadline", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="newSkill"
                      placeholder="Add a required or preferred skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      className="flex-1"
                      list="skill-suggestions"
                    />
                    <datalist id="skill-suggestions">
                      {skillSuggestions.map((skill) => (
                        <option key={skill} value={skill} />
                      ))}
                    </datalist>
                    <Select value={skillType} onValueChange={setSkillType}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Skill Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4 mr-2" /> Add Skill
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requiredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="flex items-center gap-1 pr-1 bg-emerald-500 hover:bg-emerald-600"
                      >
                        {skill} (Required)
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill, "required")}
                          className="h-5 w-5 p-0 text-white hover:text-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    {formData.preferredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {skill} (Preferred)
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill, "preferred")}
                          className="h-5 w-5 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeCommitment">Time Commitment</Label>
                    <Input
                      id="timeCommitment"
                      placeholder="e.g., 20 hours/week, full-time for 3 months"
                      value={formData.timeCommitment}
                      onChange={(e) =>
                        handleInputChange("timeCommitment", e.target.value)
                      }
                      className="w-full"
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {level.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {level.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compensation">Compensation (Optional)</Label>
                  <Input
                    id="compensation"
                    placeholder="e.g., Stipend, accommodation, travel"
                    value={formData.compensation}
                    onChange={(e) =>
                      handleInputChange("compensation", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trainingProvided"
                      checked={formData.trainingProvided}
                      onCheckedChange={(checked: boolean) =>
                        handleInputChange("trainingProvided", checked)
                      }
                    />
                    <Label htmlFor="trainingProvided">
                      Training Provided
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accommodationProvided"
                      checked={formData.accommodationProvided}
                      onCheckedChange={(checked: boolean) =>
                        handleInputChange("accommodationProvided", checked)
                      }
                    />
                    <Label htmlFor="accommodationProvided">
                      Accommodation Provided
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportationProvided"
                      checked={formData.transportationProvided}
                      onCheckedChange={(checked: boolean) =>
                        handleInputChange("transportationProvided", checked)
                      }
                    />
                    <Label htmlFor="transportationProvided">
                      Transportation Provided
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  <Input
                    id="contactInfo"
                    type="email"
                    placeholder="Enter contact email or phone number"
                    value={formData.contactInfo}
                    onChange={(e) =>
                      handleInputChange("contactInfo", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <>Submit Request <Users className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="existing" className="space-y-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900">
              My Existing Volunteer Requests
            </h2>
            {existingRequests.length === 0 ? (
              <Card className="text-center py-10">
                <CardContent>
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    You haven't posted any volunteer requests yet.
                  </p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="mt-4"
                  >
                    Create Your First Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {existingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{request.title}</CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {request.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {request.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gray-500" />
                        <Progress value={(request.volunteersApplied / request.volunteersNeeded) * 100} className="w-full" />
                        <span className="text-sm font-medium">
                          {request.volunteersApplied}/{request.volunteersNeeded} Volunteers
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Difficulty: {request.difficultyLevel}
                        </Badge>
                        {request.compensation && (
                          <Badge variant="outline" className="text-xs">
                            Compensation: {request.compensation}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {request.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                            {skill} (Required)
                          </Badge>
                        ))}
                        {request.preferredSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill} (Preferred)
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" /> View Applicants
                        </Button>
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" /> Manage
                          Responses
                        </Button>
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
