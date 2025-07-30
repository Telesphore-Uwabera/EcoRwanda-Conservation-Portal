import React, { useState, useEffect } from "react";
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
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
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
import { format } from 'date-fns';

interface WildlifeReport {
  _id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  photos: string[];
  category: string;
  urgency: string;
  status: string;
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
  verificationNotes?: string;
}

const MyReports = () => {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [reports, setReports] = useState<WildlifeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<{ [key: string]: boolean }>({});

  const toggleNotes = (reportId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching reports for user:', user._id);
        const response = await api.get(`/reports/user/${user._id}`);
        console.log('API Response:', response);

        if (response.data && Array.isArray(response.data.data)) {
        setReports(response.data.data);
        } else {
          console.error('Invalid response format:', response.data);
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

      fetchReports();
  }, [user?._id]);

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
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      case "wildlife":
        return "🦁";
      case "poaching":
        return "🚫";
      case "habitat_destruction":
        return "🏚️";
      case "wildlife_sighting":
        return "👁️";
      case "human_wildlife_conflict":
        return "⚠️";
      case "pollution":
        return "☣️";
      case "invasive_species":
        return "🦠";
      case "illegal_logging":
        return "🪓";
      case "fire":
        return "🔥";
      case "disease_outbreak":
        return "🦠";
      case "illegal_mining":
        return "⛏️";
      case "deforestation":
        return "🌲";
      case "water_pollution":
        return "💧";
      case "air_pollution":
        return "💨";
      case "soil_erosion":
        return "🏔️";
      case "climate_impact":
        return "🌡️";
      case "endangered_species":
        return "🐾";
      case "conservation_success":
        return "✅";
      case "other":
        return "📝";
      default:
        return "📝";
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.urgency?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesUrgency =
      urgencyFilter === "all" || report.urgency.toLowerCase() === urgencyFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    total: reports.length,
    verified: reports.filter((r) => r.status === "verified").length,
    pending: reports.filter((r) => r.status === "pending").length,
    investigating: reports.filter((r) => r.status === "investigating").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error: {error}
        </div>
    );
  }

  return (
      <div className="container mx-auto p-4">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-emerald-600" />
              My Reports
            </h1>
            <p className="text-gray-600">Track the status of submitted wildlife and conservation reports</p>
          </div>
            <Link to="/volunteer/submit-report">
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Submit New Report
            </Button>
            </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.verified}</div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.investigating}</div>
                <div className="text-sm text-gray-600">Investigating</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search reports by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
          <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-[180px]">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by urgency" />
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
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No reports found</h3>
            <p className="text-gray-600 mt-1">
              {reports.length === 0
                ? "You haven't submitted any reports yet"
                : "No reports match the current filters"}
            </p>
            {reports.length === 0 && (
                      <Link to="/volunteer/submit-report">
                <Button className="mt-4">Submit First Report</Button>
                      </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card key={report._id} className="overflow-hidden">
                {report.photos && report.photos.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={report.photos[0]}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{report.title || 'Untitled Report'}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status}</span>
                        </Badge>
                      </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {report.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.urgency}
                    </Badge>
                    {report.verificationNotes && report.status !== 'pending' && (
                      <button
                        onClick={() => toggleNotes(report._id)}
                        className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-2 py-1 rounded border border-emerald-300 transition-colors duration-200"
                      >
                        Verification note
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(report.submittedAt), 'PPp')}
                    </div>
                    {report.location.name && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {report.location.name}
                      </div>
                    )}
                  </div>
                  {report.verificationNotes && report.status !== 'pending' && expandedNotes[report._id] && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Verification Notes:</div>
                      <p className="text-xs text-gray-700 bg-blue-50 p-2 rounded">
                        {report.verificationNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          )}
      </div>
  );
};

export default MyReports;
