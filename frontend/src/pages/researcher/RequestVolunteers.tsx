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
  ExternalLink,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResearchProject {
  _id: string;
  title: string;
}

interface Application {
  _id: string;
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  coverLetter: string;
  portfolioLink?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface VolunteerRequest {
  _id: string;
  title: string;
  status: 'open' | 'closed';
  applications: Application[];
  numberOfVolunteersNeeded: number;
}

export default function RequestVolunteers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [existingRequests, setExistingRequests] = useState<VolunteerRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VolunteerRequest | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isHandlingApplication, setIsHandlingApplication] = useState(false);

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
        } else {
            setError(response.data.message || "Failed to load research projects. Please try again later.");
        }
      } catch (err: any) {
        console.error("Failed to fetch projects", err);
        setError(err.response?.data?.message || "Could not load research projects. Please try again later.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [user?._id]);

  const fetchRequests = async () => {
    if (!user?._id) return;
    setLoadingRequests(true);
    try {
      // Assuming an endpoint to get requests by the researcher
      const response = await api.get(`/volunteer-requests?requestedBy=${user._id}&populate=applications`);
      if (response.data.success) {
        setExistingRequests(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch volunteer requests", err);
      // Silently fail for now or set a specific error for this tab
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if(activeTab === 'view') {
      fetchRequests();
    }
  }, [activeTab, user?._id]);

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
    setError(null);
    setSuccess(false);

    if (!formData.researchProject) {
      setError("You must select a research project to associate with this request.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        researchProject: formData.researchProject,
        title: formData.title,
        description: formData.description,
        objectives: formData.objectives ? formData.objectives.split('\n').map(obj => obj.trim()).filter(Boolean) : [],
        skillsRequired: formData.requiredSkills || [],
        preferredSkills: formData.preferredSkills || [],
        location: { name: formData.location },
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        timeCommitment: formData.timeCommitment,
        difficultyLevel: formData.difficultyLevel,
        compensation: formData.compensation,
        trainingProvided: !!formData.trainingProvided,
        accommodationProvided: !!formData.accommodationProvided,
        transportationProvided: !!formData.transportationProvided,
        numberOfVolunteersNeeded: Number(formData.volunteersNeeded),
        applicationDeadline: formData.applicationDeadline,
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
      month: "long",
      day: "numeric",
    });
  };

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    setIsHandlingApplication(true);
    try {
        await api.post(`/volunteer-requests/handle-application`, { applicationId, action });
        
        const newStatus: 'accepted' | 'rejected' = action === 'accept' ? 'accepted' : 'rejected';

        const updatedRequests = existingRequests.map(req => ({
            ...req,
            applications: req.applications.map(app => 
                app._id === applicationId ? { ...app, status: newStatus } : app
            ),
        }));
        setExistingRequests(updatedRequests);
        
        setSelectedApplication(null); // Close the modal on success

    } catch (error) {
        console.error(`Failed to ${action} application`, error);
    } finally {
        setIsHandlingApplication(false);
    }
  };

  if (loadingProjects) {
  return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
    );
  }

  if (projects.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <BookMarked className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Research Projects Found</h2>
          <p className="text-gray-600 mb-4 max-w-md">You need to create a research project before you can request volunteers to join it.</p>
          <Button asChild>
            <Link to="/researcher/publish">Create First Project</Link>
                </Button>
        </div>
    );
  }

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Volunteer Recruitment Center</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <UserPlus className="mr-2 h-4 w-4" /> Create New Request
            </TabsTrigger>
            <TabsTrigger value="view">
              <Eye className="mr-2 h-4 w-4" /> View Existing Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Create a Volunteer Request</CardTitle>
                <CardDescription>
                  Fill out the form below to find the perfect volunteers for this
                  next research project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-4 bg-emerald-50 border-emerald-300">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertTitle className="text-emerald-800">Request Submitted!</AlertTitle>
                    <AlertDescription className="text-emerald-700">
                      The volunteer request has been successfully created. You will be redirected shortly.
                    </AlertDescription>
                  </Alert>
                )}
                {error && !success && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Submission Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="researchProject" className="flex items-center">
                          <BookMarked className="mr-2 h-4 w-4" />
                          Associate with Research Project
                        </Label>
                        <Select
                          onValueChange={(value) => handleInputChange("researchProject", value)}
                          defaultValue={formData.researchProject}
                          required
                        >
                          <SelectTrigger id="researchProject">
                            <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                            {projects.map((p) => (
                              <SelectItem key={p._id} value={p._id}>
                                {p.title}
                              </SelectItem>
                            ))}
                  </SelectContent>
                </Select>
                </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Request Title</Label>
                        <Input id="title" placeholder="e.g., Mountain Gorilla Behavior Study Volunteers" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Role Description</Label>
                      <Textarea id="description" placeholder="Describe the volunteer's role, responsibilities, and impact..." value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
                </div>

                    <div className="space-y-2">
                      <Label htmlFor="objectives">Key Objectives</Label>
                      <Textarea id="objectives" placeholder="List the key objectives of this volunteer role, e.g., '1. Collect behavioral data...'" value={formData.objectives} onChange={(e) => handleInputChange("objectives", e.target.value)} />
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                        <Select onValueChange={(value) => handleInputChange("location", value)} defaultValue={formData.location}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                            {rwandaLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="volunteersNeeded">Volunteers Needed</Label>
                        <Input id="volunteersNeeded" type="number" value={formData.volunteersNeeded} onChange={(e) => handleInputChange("volunteersNeeded", e.target.value)} min="1" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeCommitment">Time Commitment (Hours/Week)</Label>
                        <Input id="timeCommitment" type="number" value={formData.timeCommitment} onChange={(e) => handleInputChange("timeCommitment", e.target.value)} min="1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="applicationDeadline">Application Deadline</Label>
                        <Input id="applicationDeadline" type="date" value={formData.applicationDeadline} onChange={(e) => handleInputChange("applicationDeadline", e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Skills</Label>
                      <div className="flex gap-4 items-center">
                        <Select value={skillType} onValueChange={(v) => setSkillType(v as 'required' | 'preferred')}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="required">Required</SelectItem>
                            <SelectItem value="preferred">Preferred</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="e.g., GPS Navigation"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill}>Add Skill</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Required Skills:</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.requiredSkills.map(skill => (
                              <Badge key={skill} variant="secondary">{skill} <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill, 'required')} /></Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">Preferred Skills:</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.preferredSkills.map(skill => (
                              <Badge key={skill} variant="outline">{skill} <X className="ml-2 h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill, 'preferred')} /></Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Benefits & Support</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="trainingProvided" checked={formData.trainingProvided} onCheckedChange={(checked) => handleInputChange('trainingProvided', checked)} />
                                <Label htmlFor="trainingProvided">Training Provided</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="accommodationProvided" checked={formData.accommodationProvided} onCheckedChange={(checked) => handleInputChange('accommodationProvided', checked)} />
                                <Label htmlFor="accommodationProvided">Accommodation</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="transportationProvided" checked={formData.transportationProvided} onCheckedChange={(checked) => handleInputChange('transportationProvided', checked)} />
                                <Label htmlFor="transportationProvided">Transportation</Label>
                            </div>
                        </div>
                </div>

                  </div>
                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Volunteer Request
                    </Button>
                </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="view">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Existing Volunteer Requests</CardTitle>
                <CardDescription>
                  Manage volunteer requests and view applicants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : existingRequests.length > 0 ? (
                  <div className="space-y-6">
                    {existingRequests.map((req) => (
                      <Card key={req._id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{req.title}</CardTitle>
                              <CardDescription>
                                {req.applications.length} / {req.numberOfVolunteersNeeded} applicants
                              </CardDescription>
                            </div>
                            <Badge variant={req.status === 'open' ? 'default' : 'destructive'}>{req.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-semibold mb-2">Applicants</h4>
                          {req.applications.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                              {req.applications.map(app => (
                                <li key={app._id} className="py-3 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{app.applicant.firstName} {app.applicant.lastName}</p>
                                    <p className="text-sm text-gray-500">{app.applicant.email}</p>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                                    View Application
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No applications yet.</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                     <Users className="mx-auto h-12 w-12 text-gray-400" />
                     <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                     <p className="mt-1 text-sm text-gray-500">You haven't created any volunteer requests yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedApplication && (
          <Dialog open={!!selectedApplication} onOpenChange={(isOpen) => !isOpen && setSelectedApplication(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Application from {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}</DialogTitle>
                <DialogDescription>{selectedApplication.applicant.email}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Cover Letter</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                  {selectedApplication.portfolioLink && (
                    <div>
                      <h4 className="font-semibold mb-2">Portfolio</h4>
                      <a href={selectedApplication.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        {selectedApplication.portfolioLink} <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
          )}
                  <div>
                    <h4 className="font-semibold mb-2">Status</h4>
                    <Badge variant={
                      selectedApplication.status === 'accepted' ? 'default' :
                      selectedApplication.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {selectedApplication.status}
                    </Badge>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button variant="outline" onClick={() => handleApplicationAction(selectedApplication._id, 'reject')} disabled={isHandlingApplication}>
                        {isHandlingApplication && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reject
                      </Button>
                      <Button onClick={() => handleApplicationAction(selectedApplication._id, 'accept')} disabled={isHandlingApplication}>
                        {isHandlingApplication && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Accept Application
                        </Button>
                    </>
                  )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
}
