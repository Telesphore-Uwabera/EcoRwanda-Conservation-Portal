import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
import {
  BookOpen,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  List,
  Trash2,
} from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface ResearchProject {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
}

export default function PublishFindings() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const initialFormData = {
    title: "",
    description: "",
    objectives: [""],
    methodology: "",
    location: { name: "", lat: "", lng: "" },
    startDate: "",
    endDate: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchProjects = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await api.get(`/researchprojects/user/${user._id}`);
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?._id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData((prev) => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setFormData((prev) => ({ ...prev, objectives: [...prev.objectives, ""] }));
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, objectives: newObjectives }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    // Prepare payload to match backend requirements
    const payload = {
      title: formData.title,
      description: formData.description,
      objectives: formData.objectives,
      methodology: formData.methodology,
      location: {
        name: formData.location.name,
        lat: formData.location.lat !== '' ? Number(formData.location.lat) : undefined,
        lng: formData.location.lng !== '' ? Number(formData.location.lng) : undefined,
      },
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'planning',
      tags: [],
      leadResearcher: user?._id,
    };

    try {
      const response = await api.post('/researchprojects', payload);
      if (response.data.success) {
        setSuccess(true);
        setFormData(initialFormData); // Reset form
        fetchProjects(); // Refresh the list
      } else {
        throw new Error(response.data.error || "An unknown error occurred.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to create project.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-emerald-600" />
              Research Proposals
          </h1>
            <p className="text-gray-600 mt-1">Create new research proposals and manage existing ones.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus /> Create a New Research Proposal
                </CardTitle>
                <CardDescription>Fill out the details below to register a new proposal.</CardDescription>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1 */}
                  <div className="grid gap-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input id="title" placeholder="e.g., Impact of Tourism on Gorilla Behavior" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                  </div>

                  {/* Row 2 */}
                  <div className="grid gap-2">
                    <Label htmlFor="description">Brief Description</Label>
                    <Textarea id="description" placeholder="A short summary of the project's purpose and scope." value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
                  </div>
                  
                  {/* Row 3 - Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                        <Label>Primary Location</Label>
                    </div>
                    <div className="grid gap-2">
                        <Input id="locationName" placeholder="e.g., Nyungwe National Park" value={formData.location.name} onChange={(e) => handleLocationChange("name", e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Input id="locationLat" placeholder="Latitude" type="number" value={formData.location.lat} onChange={(e) => handleLocationChange("lat", e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Input id="locationLng" placeholder="Longitude" type="number" value={formData.location.lng} onChange={(e) => handleLocationChange("lng", e.target.value)} required />
                    </div>
                  </div>

                  {/* Row 4 - Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange("startDate", e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="endDate">Expected End Date</Label>
                        <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleInputChange("endDate", e.target.value)} required />
                    </div>
                  </div>

                  {/* Row 5 - Methodology */}
                  <div className="grid gap-2">
                    <Label htmlFor="methodology">Methodology</Label>
                    <Textarea id="methodology" placeholder="Describe the methodology that will be used for this research." value={formData.methodology} onChange={(e) => handleInputChange("methodology", e.target.value)} required />
                  </div>

                  {/* Row 6 - Objectives */}
                  <div className="grid gap-2">
                    <Label>Objectives</Label>
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Objective ${index + 1}`}
                          value={objective}
                          onChange={(e) => handleObjectiveChange(index, e.target.value)}
                          required
                        />
                        {formData.objectives.length > 1 && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeObjective(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addObjective} className="mt-2">
                      <Plus className="mr-2 h-4 w-4" /> Add Objective
                    </Button>
                  </div>


                  {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                  {success && <Alert variant="default" className="bg-green-50 border-green-200"><CheckCircle className="h-4 w-4 text-green-600" /><AlertTitle>Success!</AlertTitle><AlertDescription>Project created successfully.</AlertDescription></Alert>}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                </Button>
                </form>
                </CardContent>
              </Card>
                  </div>

          <div>
              <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List /> Projects
                </CardTitle>
                </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : projects.length > 0 ? (
                  <>
                  <ul className="space-y-4">
                      {(showAllProjects ? projects : projects.slice(0, 6)).map((project) => (
                      <li key={project._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <h3 className="font-semibold text-gray-800">{project.title}</h3>
                        <div className="text-sm text-gray-500 flex justify-between items-center mt-2">
                          <Badge variant={project.status === 'active' ? 'default' : 'outline'}>{project.status}</Badge>
                          <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                            </li>
                          ))}
                        </ul>
                    {projects.length > 6 && (
                      <Button
                        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setShowAllProjects((prev) => !prev)}
                      >
                        {showAllProjects ? 'Show Less' : 'View More'}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>You have not created any projects yet.</p>
                    <p className="text-xs">Use the form on the left to get started.</p>
                  </div>
                )}
                </CardContent>
              </Card>
          </div>
              </div>
      </div>
  );
}
