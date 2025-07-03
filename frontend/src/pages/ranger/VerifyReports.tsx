import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Image,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import api from "@/config/api";
import { THREAT_CATEGORIES } from "@/components/common/categories";

interface Report {
  _id: string;
  title: string;
  description: string;
  location: { name: string; lat: number; lng: number };
  category: string;
  urgency: string;
  status: string;
  submittedBy: { _id: string; firstName: string; lastName: string; email: string };
  submittedAt: string;
  photos: string[];
  updates: Array<{ note: string; timestamp: string; updatedBy?: { _id: string; firstName: string; lastName: string } }>;
}

export default function VerifyReports() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [verifiedReportsCount, setVerifiedReportsCount] = useState(0);
  const [otherCategory, setOtherCategory] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        let response;
        if (reportId && reportId !== 'undefined') {
          response = await api.get(`/reports/${reportId}`);
          setSelectedReport(response.data.data);
        } else {
          response = await api.get('/reports?status=pending');
          setReports(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        console.error("Full error object:", JSON.stringify(err, null, 2));
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isOnline) {
      fetchReports();
    } else {
      setLoading(false);
      setError("Offline mode: Cannot fetch live reports. Data might be outdated.");
    }
  }, [user, isOnline, reportId]);

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const verifiedCount = reports.filter(report => 
      report.status === 'verified' &&
      new Date(report.submittedAt).getMonth() === currentMonth &&
      new Date(report.submittedAt).getFullYear() === currentYear
    ).length;
    setVerifiedReportsCount(verifiedCount);
  }, [reports]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-emerald-100 text-emerald-800";
      case "investigating":
        return "bg-amber-100 text-amber-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "investigating":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
      report.location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency =
      urgencyFilter === "all" || report.urgency === urgencyFilter;
    const matchesCategory =
      categoryFilter === "all" || report.category === categoryFilter;

    return matchesSearch && matchesUrgency && matchesCategory;
  });

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedReport || !user || isUpdating) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const updatePayload = {
        status: newStatus,
        notes: verificationNotes,
        updatedBy: user._id,
      };
      await api.put(`/reports/${selectedReport._id}`, updatePayload);
      setUpdateSuccess(true);
      setSelectedReport((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
          updates: [
            ...prev.updates,
            {
              note: verificationNotes,
              timestamp: new Date().toISOString(),
              updatedBy: { _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
            },
          ],
        };
      });
    setVerificationNotes("");

    } catch (err) {
      console.error("Error updating report status:", err);
      setUpdateError("Failed to update report status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-amber-600" />
            Verify Wildlife Reports
          </h1>
          <p className="text-gray-600">
            Review and verify volunteer-submitted wildlife incident reports
          </p>
        </div>

        {selectedReport ? (
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold text-gray-900">
                {selectedReport.title}
              </CardTitle>
              <Badge className={getStatusColor(selectedReport.status)}>
                {getStatusIcon(selectedReport.status)}
                <span className="ml-1">{selectedReport.status}</span>
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={() => { setSelectedReport(null); navigate('/ranger/verify-reports'); }} variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Reports List
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Description</p>
                  <p className="text-gray-800 text-sm">{selectedReport.description}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Location</p>
                  <p className="text-gray-800 text-sm flex items-center gap-1"><MapPin className="h-4 w-4"/> {selectedReport.location.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Category</p>
                  <p className="text-gray-800 text-sm flex items-center gap-1">{getCategoryIcon(selectedReport.category)} {selectedReport.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Urgency</p>
                  <p className={`text-sm flex items-center gap-1 ${getUrgencyColor(selectedReport.urgency)}`}><AlertTriangle className="h-4 w-4"/> {selectedReport.urgency} priority</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Submitted By</p>
                  <p className="text-gray-800 text-sm flex items-center gap-1"><User className="h-4 w-4"/> {selectedReport.submittedBy.firstName} {selectedReport.submittedBy.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-2 font-medium">Submitted At</p>
                  <p className="text-gray-800 text-sm flex items-center gap-1"><Calendar className="h-4 w-4"/> {formatDate(selectedReport.submittedAt)}</p>
                </div>
              </div>

              {selectedReport.photos && selectedReport.photos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Photos</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {selectedReport.photos.map((url, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-md">
                        <img src={url} alt={`Report Photo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Verification Action</h3>
                {updateSuccess && (
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800">
                      Report status updated successfully!
                    </AlertDescription>
                  </Alert>
                )}
                {updateError && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {updateError}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status-select">Update Status</Label>
                    <Select onValueChange={(value) => handleUpdateStatus(value)} value={selectedReport.status} disabled={isUpdating}>
                      <SelectTrigger id="status-select">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Verification Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about the verification..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handleUpdateStatus(selectedReport.status)}
                  disabled={isUpdating}
                >
                  {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Apply Status Update"}
                </Button>
              </div>
            </CardContent>
          </Card>

        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {reports.filter(r => r.status === 'pending').length}
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
                        {reports.filter(r => r.urgency === 'critical').length}
                      </p>
                      <p className="text-sm text-red-700">Critical Urgency</p>
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
                        {verifiedReportsCount}
                      </p>
                      <p className="text-sm text-emerald-700">Verified This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Search className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {reports.filter(r => r.status === 'investigating').length}
                      </p>
                      <p className="text-sm text-blue-700">Investigating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {THREAT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryFilter === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Please specify the category"
                  value={otherCategory || ""}
                  onChange={e => setOtherCategory(e.target.value)}
                  required
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
              {loading ? (
                <p>Loading reports...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No reports match your filters
                </h3>
                <p className="text-gray-600">
                      Try adjusting your search terms or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {filteredReports.map((report) => (
                    <Card key={report._id} className="hover:shadow-md transition-shadow h-full min-h-[340px] flex flex-col">
                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">
                                {getCategoryIcon(report.category)}
                              </span>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-gray-900">
                                  {report.title}
                                </h3>
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                        {report.description}
                                </p>
                              </div>
                            </div>
                                <Badge className={getStatusColor(report.status)}>
                                  {getStatusIcon(report.status)}
                                  <span className="ml-1">{report.status}</span>
                              </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                      {report.location.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(report.submittedAt)}
                              </span>
                              <span className={`flex items-center gap-1 ${getUrgencyColor(report.urgency)}`}> <AlertTriangle className="h-3 w-3" /> {report.urgency} priority </span>
                              <span className="flex items-center gap-1"> <Camera className="h-3 w-3" /> {report.photos.length} photos </span>
                              {report.updates.length > 0 && (
                                <span className="flex items-center gap-1"> <MessageSquare className="h-3 w-3" /> {report.updates.length} updates </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col mt-auto">
                          <div className="flex gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              <Link to={`/ranger/verify-reports?reportId=${report._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View & Verify
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
          )}
        </div>
          </>
        )}
      </div>
  );
}
