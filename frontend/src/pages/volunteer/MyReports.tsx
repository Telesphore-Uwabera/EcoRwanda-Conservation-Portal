import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import {
  Camera,
  Search,
  Filter,
  Eye,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";

export default function MyReports() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // TODO: Fetch user's reports from MongoDB backend
  const reports = [];

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
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesUrgency =
      urgencyFilter === "all" || report.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    total: reports.length,
    verified: reports.filter((r) => r.status === "verified").length,
    pending: reports.filter((r) => r.status === "pending").length,
    investigating: reports.filter((r) => r.status === "investigating").length,
  };

  return (
    <DashboardLayout>
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-emerald-600" />
              My Reports
            </h1>
            <p className="text-gray-600">
              Track the status of your submitted wildlife and conservation
              reports
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link to="/volunteer/submit-report">
              <Camera className="h-4 w-4 mr-2" />
              Submit New Report
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-blue-700">Total Reports</p>
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
                    {stats.verified}
                  </p>
                  <p className="text-sm text-emerald-700">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-900">
                    {stats.investigating}
                  </p>
                  <p className="text-sm text-amber-700">Investigating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                  <p className="text-sm text-gray-700">Pending</p>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No reports found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  urgencyFilter !== "all"
                    ? "Try adjusting your search filters"
                    : "You haven't submitted any reports yet"}
                </p>
                {!searchTerm &&
                  statusFilter === "all" &&
                  urgencyFilter === "all" && (
                    <Button
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Link to="/volunteer/submit-report">
                        <Camera className="h-4 w-4 mr-2" />
                        Submit Your First Report
                      </Link>
                    </Button>
                  )}
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
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {report.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.submittedAt)}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${getUrgencyColor(report.urgency)}`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {report.urgency} priority
                      </span>
                      <span className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {report.photos} photos
                      </span>
                      {report.updates.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {report.updates.length} updates
                        </span>
                      )}
                    </div>

                    {/* Latest Update */}
                    {report.updates.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {
                                report.updates[report.updates.length - 1]
                                  .message
                              }
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              by{" "}
                              {report.updates[report.updates.length - 1].author}{" "}
                              •{" "}
                              {formatDate(
                                report.updates[report.updates.length - 1].date,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {report.updates.length > 0 && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View All Updates ({report.updates.length})
                        </Button>
                      )}
                    </div>
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
