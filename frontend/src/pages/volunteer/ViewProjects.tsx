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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfflineIndicator } from "@/components/common/OfflineIndicator";
import { useOfflineStatus } from "@/lib/offline";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
import {
  TreePine,
  Search,
  MapPin,
  Users,
  Calendar,
  Award,
  Clock,
  Target,
  Heart,
  Leaf,
  Mountain,
  Droplets,
  UserPlus,
  ExternalLink,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VolunteerRequest {
  _id: string;
  title: string;
  description: string;
  location: { name: string };
  startDate: string;
  endDate: string;
  numberOfVolunteersNeeded: number;
  status: 'open' | 'closed';
  researchProject: {
    title: string;
  };
}

export default function ViewProjects() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("available");
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/volunteer-requests');
        if (response.data.success) {
          setRequests(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch volunteer opportunities.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred while fetching data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reforestation":
        return <TreePine className="h-5 w-5 text-emerald-600" />;
      case "wildlife_monitoring":
        return <Mountain className="h-5 w-5 text-amber-600" />;
      case "water_conservation":
        return <Droplets className="h-5 w-5 text-blue-600" />;
      case "education":
        return <Users className="h-5 w-5 text-purple-600" />;
      case "cleanup":
        return <Leaf className="h-5 w-5 text-green-600" />;
      default:
        return <Heart className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-800";
      case "Intermediate":
        return "bg-amber-100 text-amber-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = requests.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.name.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No Projects Found</h3>
          <p className="text-gray-500 mt-2">There are currently no open volunteer opportunities. Please check back later.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((req) => (
          <Card key={req._id} className="flex flex-col">
            <CardHeader>
              <Badge variant={req.status === 'open' ? 'default' : 'destructive'} className="w-fit mb-2">{req.status}</Badge>
              <CardTitle>{req.title}</CardTitle>
              <CardDescription>Part of: {req.researchProject.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{req.description}</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {req.location.name}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(req.startDate)} - {formatDate(req.endDate)}</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {req.numberOfVolunteersNeeded} volunteers needed</div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild>
                <Link to={`/volunteer/request/${req._id}`}>View Details & Apply</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Opportunities</h1>
          <p className="text-gray-600">Find and apply for volunteer positions in research projects across Rwanda.</p>
        </div>
      </div>

      {/* Filter section can be added here later */}

      {renderContent()}
    </div>
  );
}
