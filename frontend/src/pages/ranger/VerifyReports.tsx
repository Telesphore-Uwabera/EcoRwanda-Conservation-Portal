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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  MapPin,
  Clock,
  Camera,
  AlertTriangle,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import api from "@/config/api";

interface AnalyticsStats {
  activityStats: {
    verifiedReportsThisMonth: number;
  };
}

export default function VerifyReports() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verifiedReportsCount, setVerifiedReportsCount] = useState(0);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await api.get('/analytics');
        setVerifiedReportsCount(response.data.data.activityStats.verifiedReportsThisMonth);
      } catch (error) {
        console.error("Failed to fetch analytics counts:", error);
      }
    };

    const fetchReports = async () => {
      try {
        // TODO: Implement API endpoint for fetching reports to verify
        // For now, returning an empty array or mock data if needed for testing
        const response = await api.get('/reports/pending-verification'); // Placeholder
        setReports(response.data.data); // Assuming the API returns an array of reports
      } catch (error) {
        console.error("Failed to fetch reports for verification:", error);
      }
    };

    if (user && isOnline) {
      fetchCounts();
      fetchReports();
    }
  }, [user, isOnline]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 font-bold";
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-emerald-600";
      default:
        return "text-gray-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "poaching":
        return "🎯";
      case "habitat_destruction":
        return "🌳";
      case "wildlife_sighting":
        return "🦁";
      case "human_wildlife_conflict":
        return "⚠️";
      case "pollution":
        return "🏭";
      default:
        return "📝";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate_action":
        return "bg-red-100 text-red-800 border-red-300";
      case "research_value":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "monitoring":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency =
      urgencyFilter === "all" || report.urgency === urgencyFilter;
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;

    return matchesSearch && matchesUrgency && matchesCategory;
  });

  const handleVerifyReport = (
    reportId: string,
    action: "approve" | "request_info",
  ) => {
    console.log(`${action} report:`, reportId, "Notes:", verificationNotes);
    // In real app, this would make API calls
    setVerificationNotes("");
    setSelectedReport(null);
  };

  return (
    <DashboardLayout>
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-amber-600" />
            Verify Wildlife Reports
          </h1>
          <p className="text-gray-600">
            Review and verify volunteer-submitted wildlife incident reports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {reports.length}
                  </p>
                  <p className="text-sm text-amber-700">Pending Verification</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900">
                    {
                      reports.filter(
                        (r) => r.urgency === "high" || r.urgency === "critical",
                      ).length
                    }
                  </p>
                  <p className="text-sm text-red-700">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Camera className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {reports.reduce((sum, r) => sum + r.photos.length, 0)}
                  </p>
                  <p className="text-sm text-blue-700">Photos to Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {verifiedReportsCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Verified This Month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reports by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="poaching">Poaching</SelectItem>
                  <SelectItem value="habitat_destruction">
                    Habitat Destruction
                  </SelectItem>
                  <SelectItem value="wildlife_sighting">
                    Wildlife Sighting
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No reports to verify
                </h3>
                <p className="text-gray-600">
                  All reports have been processed or no reports match your
                  filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {getCategoryIcon(report.category)}
                        </span>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Reported by {report.submittedBy} (
                            {report.submitterRole})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`border ${getPriorityColor(report.priority)}`}
                        >
                          {report.priority.replace("_", " ")}
                        </Badge>
                        <Badge
                          className={`${getUrgencyColor(report.urgency)} bg-transparent border`}
                        >
                          {report.urgency} urgency
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700">
                      {report.description}
                    </p>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {report.photos.length} photos
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        GPS: ±{report.evidence.gpsAccuracy}
                      </span>
                    </div>

                    {/* Photo Thumbnails */}
                    {report.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto">
                        {report.photos.slice(0, 5).map((photo) => (
                          <div key={photo.id} className="flex-shrink-0">
                            <img
                              src={photo.url}
                              alt={photo.description}
                              className="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                          </div>
                        ))}
                        {report.photos.length > 5 && (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                            +{report.photos.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evidence Details */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Evidence Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <span>
                          Incident Time:{" "}
                          {formatDate(report.evidence.timeOfIncident)}
                        </span>
                        <span>
                          Weather: {report.evidence.weatherConditions}
                        </span>
                        <span>
                          Coordinates: {report.coordinates.lat.toFixed(4)},{" "}
                          {report.coordinates.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Verification Section */}
                    {selectedReport === report.id ? (
                      <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg space-y-4">
                        <h4 className="font-medium text-amber-900">
                          Verification Notes
                        </h4>
                        <Textarea
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          placeholder="Add verification notes, follow-up actions, or additional information..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleVerifyReport(report.id, "approve")
                            }
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify & Approve
                          </Button>
                          <Button
                            onClick={() =>
                              handleVerifyReport(report.id, "request_info")
                            }
                            variant="outline"
                            className="flex-1"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request More Info
                          </Button>
                          <Button
                            onClick={() => setSelectedReport(null)}
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedReport(report.id)}
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Start Verification
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
