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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus, offlineManager } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
import {
  Camera,
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Navigation,
  Image,
} from "lucide-react";

export default function SubmitReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOfflineStatus();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "",
    location: {
      name: "",
      lat: 0,
      lng: 0,
    },
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const categories = [
    { value: "poaching", label: "Illegal Poaching Activity", icon: "🎯" },
    { value: "habitat_destruction", label: "Habitat Destruction", icon: "🌳" },
    { value: "wildlife_sighting", label: "Wildlife Sighting", icon: "🦁" },
    {
      value: "human_wildlife_conflict",
      label: "Human-Wildlife Conflict",
      icon: "⚠️",
    },
    { value: "pollution", label: "Environmental Pollution", icon: "🏭" },
    { value: "other", label: "Other Conservation Issue", icon: "📝" },
  ];

  const urgencyLevels = [
    {
      value: "low",
      label: "Low Priority",
      color: "bg-emerald-100 text-emerald-800",
      description: "Non-urgent observation",
    },
    {
      value: "medium",
      label: "Medium Priority",
      color: "bg-amber-100 text-amber-800",
      description: "Requires attention",
    },
    {
      value: "high",
      label: "High Priority",
      color: "bg-red-100 text-red-800",
      description: "Urgent response needed",
    },
    {
      value: "critical",
      label: "Critical",
      color: "bg-red-200 text-red-900",
      description: "Immediate action required",
    },
  ];

  const rwandaLocations = [
    "Volcanoes National Park",
    "Nyungwe National Park",
    "Akagera National Park",
    "Gishwati-Mukura National Park",
    "Kigali City",
    "Musanze District",
    "Nyagatare District",
    "Huye District",
    "Rubavu District",
    "Nyanza District",
    "Kayonza District",
    "Rwamagana District",
    "Other Location",
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("location.")) {
      const locationField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
        },
      );
    } else {
      setGettingLocation(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos((prev) => [...prev, ...files].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reportData = {
        ...formData,
        photos: photos.map((file) => file.name),
        submittedBy: user?.id,
        submittedAt: new Date().toISOString(),
        status: "pending",
      };

      if (isOnline) {
        // Actual API submission
        await api.post('/reports', reportData);
        console.log("Report submitted online:", reportData);
      } else {
        // Store offline
        await offlineManager.storeData("wildlife_report", reportData);
        console.log("Report stored offline:", reportData);
      }

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          category: "",
          urgency: "",
          location: { name: "", lat: 0, lng: 0 },
        });
        setPhotos([]);
        setSuccess(false);
        navigate("/volunteer/my-reports");
      }, 3000);
    } catch (error) {
      console.error("Error submitting report:", error);
      // Display error message to user
      // setError("Failed to submit report. Please try again.");
      // Basic error display for now
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Submission Error: ${error.response.data.error}`);
      } else {
        alert("Failed to submit report. Please try again.");
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Camera className="h-8 w-8 text-emerald-600" />
            Submit Wildlife Report
          </h1>
          <p className="text-gray-600">
            Report wildlife incidents, conservation concerns, or observations to
            help protect Rwanda's ecosystems
          </p>
        </div>

        {success && (
          <Alert className="border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              Your report has been submitted successfully!
              {!isOnline && " It will be synced when you come back online."}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Report Details
              </CardTitle>
              <CardDescription>
                Provide clear and detailed information about the incident or
                observation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Brief description of the incident"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
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
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(value) =>
                      handleInputChange("urgency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How urgent is this?" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={level.color}>{level.label}</Badge>
                            <span className="text-sm text-gray-600">
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
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Provide a detailed description of what you observed. Include time, weather conditions, number of people/animals involved, etc."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Location Information
              </CardTitle>
              <CardDescription>
                Specify where the incident occurred for accurate tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="locationName">Location Name</Label>
                  <Select
                    value={formData.location.name}
                    onValueChange={(value) =>
                      handleInputChange("location.name", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select or specify location" />
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
                  <Label>GPS Coordinates</Label>
                  <div className="flex gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="flex-1 w-full"
                    >
                      {gettingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Current Location
                        </>
                      )}
                    </Button>
                  </div>
                  {formData.location.lat !== 0 && (
                    <p className="text-sm text-gray-600">
                      Coordinates: {formData.location.lat.toFixed(6)},{" "}
                      {formData.location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Evidence */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-600" />
                Photo Evidence
              </CardTitle>
              <CardDescription>
                Upload photos to support your report (up to 5 photos, max 10MB
                each)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/dashboard/volunteer")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.category ||
                !formData.urgency
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}