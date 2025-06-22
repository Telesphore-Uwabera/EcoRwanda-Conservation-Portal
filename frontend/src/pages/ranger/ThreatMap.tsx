import React, { useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
import { Map as MapIcon, Filter } from "lucide-react";

// Define an interface for a single wildlife report
interface WildlifeReport {
  _id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  createdAt: string;
  submittedBy?: { firstName?: string };
}

// Define colors for each threat category for consistent styling
const categoryColors: { [key: string]: string } = {
  poaching: "red",
  habitat_destruction: "orange",
  wildlife_sighting: "blue",
  human_wildlife_conflict: "purple",
  other: "gray",
};

const urgencyColors: { [key: string]: string } = {
  high: "bg-red-600 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-600 text-white",
};

export default function ThreatMap() {
  const [reports, setReports] = useState<WildlifeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WildlifeReport[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<WildlifeReport | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = user?.token;
        const response = await api.get("/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data.data);
        setFilteredReports(response.data.data);
      } catch (err) {
        setError("Failed to fetch reports.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    let newFilteredReports = reports;

    if (categoryFilter !== "all") {
      newFilteredReports = newFilteredReports.filter(
        (report) => report.category === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      newFilteredReports = newFilteredReports.filter(
        (report) => report.status === statusFilter
      );
    }

    setFilteredReports(newFilteredReports);
  }, [categoryFilter, statusFilter, reports]);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  // Summary calculations
  const totalThreats = filteredReports.length;
  const threatsByCategory = Object.keys(categoryColors).map(cat => ({
    category: cat,
    count: filteredReports.filter(r => r.category === cat).length,
  }));
  const threatsByUrgency = ["high", "medium", "low"].map(urg => ({
    urgency: urg,
    count: filteredReports.filter(r => r.urgency === urg).length,
  }));

  // Default map center
  const mapCenter = filteredReports.length > 0
    ? [filteredReports[0].location.lng, filteredReports[0].location.lat]
    : [29.8739, -1.9441];

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
        <MapIcon /> Threat Map
      </h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalThreats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {threatsByCategory.map(({ category, count }) => (
              <Badge key={category} className="capitalize" style={{ background: categoryColors[category], color: 'white' }}>{category.replace(/_/g, ' ')}: {count}</Badge>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By Severity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {threatsByUrgency.map(({ urgency, count }) => (
              <Badge key={urgency} className={urgencyColors[urgency] + ' capitalize'}>{urgency}: {count}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="border rounded px-2 py-1 w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(categoryColors).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border rounded px-2 py-1 w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Map in Card */}
      <Card className="mb-4 shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height: '500px', width: '100%' }}>
            <ReactMapGL
              longitude={mapCenter[0]}
              latitude={mapCenter[1]}
              zoom={8}
              width="100%"
              height="500px"
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              onViewportChange={() => {}}
            >
              {filteredReports.map(report => (
                <Marker
                  key={report._id}
                  longitude={report.location.lng}
                  latitude={report.location.lat}
                  offsetLeft={-12}
                  offsetTop={-24}
                  onClick={e => {
                    e.originalEvent.stopPropagation();
                    setSelectedReport(report);
                  }}
                />
              ))}
              {selectedReport && (
                <Popup
                  longitude={selectedReport.location.lng}
                  latitude={selectedReport.location.lat}
                  onClose={() => setSelectedReport(null)}
                  closeOnClick={false}
                >
                  <div className="space-y-1">
                    <div className="font-bold">{selectedReport.category}</div>
                    <Badge>{selectedReport.urgency}</Badge>
                    <div><b>Location:</b> {selectedReport.location.name}</div>
                    <div><b>Date:</b> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : 'N/A'}</div>
                    <div><b>Reporter:</b> {selectedReport.submittedBy?.firstName || 'Unknown'}</div>
                    <div className="text-sm text-gray-700">{selectedReport.description}</div>
                  </div>
                </Popup>
              )}
            </ReactMapGL>
          </div>
        </CardContent>
      </Card>
      {/* Threats List/Table */}
      <Card>
        <CardHeader>
          <CardTitle>Threats List</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Severity</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Reporter</th>
                <th className="px-3 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">No threats found.</td>
                </tr>
              )}
              {filteredReports.map(report => (
                <tr key={report._id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 capitalize">
                    <Badge className="capitalize" style={{ background: categoryColors[report.category], color: 'white' }}>{report.category.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={urgencyColors[report.urgency] + ' capitalize'}>{report.urgency}</Badge>
                  </td>
                  <td className="px-3 py-2 capitalize">{report.status}</td>
                  <td className="px-3 py-2">{report.location.name}</td>
                  <td className="px-3 py-2">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{report.submittedBy?.firstName || 'Unknown'}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={report.description}>{report.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}