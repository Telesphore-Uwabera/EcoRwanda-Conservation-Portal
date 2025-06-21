import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
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
  AlertCircle,
  BookMarked,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface ResearchProject {
  _id: string;
  title: string;
}

export default function RequestVolunteers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    researchProject: "",
    title: "",
    description: "",
    objectives: "",
    location: "Volcanoes National Park",
    duration: "",
    startDate: "",
    endDate: "",
    volunteersNeeded: 10,
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    timeCommitment: "20",
    difficultyLevel: "intermediate",
    compensation: "Stipend Provided",
    trainingProvided: true,
    accommodationProvided: true,
    transportationProvided: true,
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

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?._id) return;
      try {
        const response = await api.get(`/researchprojects/user/${user._id}`);
        if (response.data.success) {
          setProjects(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
        setError("Could not load your research projects. Please try again later.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [user?._id]);

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
    setError("");
    setSuccess(false);

    if (!formData.researchProject) {
      setError("You must select a research project to associate with this request.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        ...formData,
        numberOfVolunteersNeeded: Number(formData.volunteersNeeded),
        skillsRequired: formData.requiredSkills,
        // The backend expects a location object, but for now we send a string.
        // We will need to adjust the backend or geocode on the front-end later.
        // Let's satisfy the schema with a dummy structure for now.
        location: {
          name: formData.location,
          lat: 6.45, // Placeholder for Kigali
          lng: 30.06, // Placeholder for Kigali
        }
      };

      const response = await api.post('/volunteer-requests', requestData);

      if (response.data.success) {
      setSuccess(true);
        setTimeout(() => navigate('/dashboard/researcher'), 2000);
      } else {
        throw new Error(response.data.error || "An unknown error occurred.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit request.";
      console.error("Submission error:", errorMessage);
      setError(errorMessage);
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

  if (loadingProjects) {
  return (
    <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="ml-2">Loading your projects...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4 flex justify-center items-center h-full">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Research Projects Found</AlertTitle>
            <AlertDescription>
              You must create a research project before you can request volunteers.
              <br />
              <Link to="/researcher/publish">
                <Button variant="link" className="p-0 h-auto mt-2">
                  Click here to create your first project.
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-6 w-6 text-emerald-600" />
              Request Volunteers
            </h1>
            <p className="text-gray-600">Create a new request for volunteers to join your research project.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
              <CardTitle>1. Project Information</CardTitle>
              <CardDescription>Select the project you are recruiting for and provide a title for the request.</CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="researchProject">Which project is this for?</Label>
                <Select onValueChange={(value) => handleInputChange("researchProject", value)} value={formData.researchProject}>
                  <SelectTrigger id="researchProject" className="h-11">
                    <SelectValue placeholder="Select a research project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                </div>
              <div className="grid gap-2">
                <Label htmlFor="title">What is the title of this volunteer request?</Label>
                <Input id="title" placeholder="e.g., Field Assistants for Gorilla Behavior Study" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required className="h-11"/>
                </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Describe the volunteer role and responsibilities</Label>
                <Textarea id="description" placeholder="Provide a detailed overview of what the volunteers will be doing, the goals of their work, and the impact they will have..." value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required rows={5}/>
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>2. Logistical Details</CardTitle>
              <CardDescription>Specify the location, dates, and number of volunteers required for this opportunity.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Select onValueChange={(value) => handleInputChange("location", value)} value={formData.location}>
                        <SelectTrigger id="location" className="h-11">
                            <SelectValue placeholder="Select location"/>
                      </SelectTrigger>
                      <SelectContent>
                            {rwandaLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                <div className="grid gap-2">
                    <Label htmlFor="volunteersNeeded">Number of Volunteers Needed</Label>
                    <Input id="volunteersNeeded" type="number" value={formData.volunteersNeeded} onChange={(e) => handleInputChange("volunteersNeeded", e.target.value)} min="1" required className="h-11"/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} required className="h-11"/>
                  </div>
                <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} required className="h-11"/>
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <Input id="applicationDeadline" type="date" value={formData.applicationDeadline} onChange={(e) => handleInputChange("applicationDeadline", e.target.value)} required className="h-11"/>
                </div>
              </CardContent>
            </Card>

          {/* ... other form cards ... */}
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Submitting Request</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Request Submitted Successfully!</AlertTitle>
              <AlertDescription>Your volunteer request has been posted. You will be redirected shortly.</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate(-1)} className="h-11">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="h-11">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
