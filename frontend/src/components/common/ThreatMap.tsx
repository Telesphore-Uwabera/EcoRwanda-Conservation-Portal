import React, { useEffect, useState } from 'react';
import ReactMapGL, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
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
import { Map as MapIcon, Filter, MapPin } from "lucide-react";
import { THREAT_CATEGORIES } from "@/components/common/categories";
import { Input } from "@/components/ui/input";

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
  wildlife: "green",
  poaching: "red",
  habitat_destruction: "orange",
  wildlife_sighting: "blue",
  human_wildlife_conflict: "purple",
  pollution: "brown",
  invasive_species: "pink",
  illegal_logging: "darkred",
  fire: "red",
  disease_outbreak: "yellow",
  illegal_mining: "gray",
  deforestation: "darkgreen",
  water_pollution: "cyan",
  air_pollution: "lightblue",
  soil_erosion: "tan",
  climate_impact: "orange",
  endangered_species: "darkblue",
  conservation_success: "green",
  other: "gray",
};

const urgencyColors: { [key: string]: string } = {
  critical: "#000000",
  high: "#dc2626",
  medium: "#f59e42",
  low: "#16a34a",
};

// Rwanda bounding box: Southwest [-2.85, 28.85], Northeast [-1.05, 30.9]
const rwandaBounds = [
  [28.85, -2.85], // Southwest (lng, lat)
  [30.9, -1.05],  // Northeast (lng, lat)
];

// Rwanda GeoJSON polygon (approximate, for demo)
const rwandaPolygon = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [[
      [28.861, -2.825],
      [28.861, -1.055],
      [30.899, -1.055],
      [30.899, -2.825],
      [28.861, -2.825],
    ]],
  },
} as const;

// World polygon with a hole for Rwanda
const worldWithHole = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
      ],
      ...rwandaPolygon.geometry.coordinates
    ],
  },
} as const;

// Rwanda bounding box for clamping
const rwandaBoundsBox = {
  minLng: 28.85,
  minLat: -2.85,
  maxLng: 30.9,
  maxLat: -1.05,
};

function clampToRwanda(lng: number, lat: number) {
  return [
    Math.max(rwandaBoundsBox.minLng, Math.min(rwandaBoundsBox.maxLng, lng)),
    Math.max(rwandaBoundsBox.minLat, Math.min(rwandaBoundsBox.maxLat, lat)),
  ];
}

// Add a LineLayer for Rwanda boundary
const rwandaBoundaryLayer = {
  id: 'rwanda-boundary',
  type: 'line' as const,
  source: 'rwanda',
  paint: {
    'line-color': '#22c55e', // emerald-500
    'line-width': 4,
    'line-opacity': 1,
  },
};

export default function ThreatMap() {
  const [reports, setReports] = useState<WildlifeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WildlifeReport[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<WildlifeReport | null>(null);
  const [otherCategory, setOtherCategory] = useState<string | null>(null);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);

  // Default map center
  const mapCenter = filteredReports.length > 0
    ? [filteredReports[0].location.lng, filteredReports[0].location.lat]
    : [29.8739, -1.9441];

  // Controlled map view state
  const [viewState, setViewState] = useState({
    longitude: mapCenter[0],
    latitude: mapCenter[1],
    zoom: 8,
  });

  useEffect(() => {
    // Update viewState center if filteredReports change
    setViewState((prev) => ({
      ...prev,
      longitude: mapCenter[0],
      latitude: mapCenter[1],
    }));
    // eslint-disable-next-line
  }, [mapCenter[0], mapCenter[1]]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = user?.token;
        const response = await api.get("/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(response.data.data);
        setFilteredReports(response.data.data);
        console.log('Fetched threats on first visit:', response.data.data.length, response.data.data);
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
    if (reports.length === 0) return; // Only filter if data is loaded

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

    if (urgencyFilter !== "all") {
      newFilteredReports = newFilteredReports.filter(
        (report) => report.urgency === urgencyFilter
      );
    }

    setFilteredReports(newFilteredReports);
    console.log('Threats after filtering:', newFilteredReports.length, newFilteredReports);
  }, [categoryFilter, statusFilter, urgencyFilter, reports]);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  // Summary calculations
  const totalThreats = filteredReports.length;
  const threatsByUrgency = ["critical", "high", "medium", "low"]
    .map(urg => ({
      urgency: urg,
      count: filteredReports.filter(r => r.urgency === urg).length,
    }))
    .filter(item => item.count > 0);

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
            <CardTitle>By Severity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {threatsByUrgency.map(({ urgency, count }) => (
              <Badge key={urgency} className="capitalize" style={{ background: urgencyColors[urgency], color: '#fff' }}>{urgency}: {count}</Badge>
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
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="all" className="text-xs py-1">All Categories</SelectItem>
                {THREAT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-xs py-1">{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {categoryFilter === "other" && (
            <Input
              className="mt-2"
              placeholder="Please specify the category"
              value={otherCategory || ""}
              onChange={e => setOtherCategory(e.target.value)}
              required
            />
          )}
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
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="border rounded px-2 py-1 w-48">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Map in Card */}
      <Card className="mb-4 shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0 relative">
          {/* Map Legend */}
          <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 rounded shadow p-2 flex flex-col gap-1 border">
            <div className="font-semibold text-xs mb-1">Legend</div>
            <div className="flex items-center gap-2 text-xs"><span style={{display:'inline-block',width:16,height:16,background:urgencyColors.critical,borderRadius:'50%'}}></span> Critical</div>
            <div className="flex items-center gap-2 text-xs"><span style={{display:'inline-block',width:16,height:16,background:urgencyColors.high,borderRadius:'50%'}}></span> High</div>
            <div className="flex items-center gap-2 text-xs"><span style={{display:'inline-block',width:16,height:16,background:urgencyColors.medium,borderRadius:'50%'}}></span> Medium</div>
            <div className="flex items-center gap-2 text-xs"><span style={{display:'inline-block',width:16,height:16,background:urgencyColors.low,borderRadius:'50%'}}></span> Low</div>
          </div>
          <div style={{ height: '500px', width: '100%' }}>
            <ReactMapGL
              {...viewState}
              minZoom={7}
              maxZoom={16}
              width="100%"
              height="500px"
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              onViewportChange={(nextViewState) => {
                const [clampedLng, clampedLat] = clampToRwanda(nextViewState.longitude, nextViewState.latitude);
                setViewState({
                  longitude: clampedLng,
                  latitude: clampedLat,
                  zoom: Math.max(7, Math.min(16, nextViewState.zoom)),
                });
              }}
            >
              <div style={{ position: 'absolute', left: 10, top: 10 }}>
                <NavigationControl />
              </div>
              <Source id="mask" type="geojson" data={{ ...worldWithHole, geometry: { ...worldWithHole.geometry, coordinates: worldWithHole.geometry.coordinates as unknown as number[][][] } }}>
                <Layer
                  id="mask-layer"
                  type="fill"
                  paint={{
                    'fill-color': '#f8fafc',
                    'fill-opacity': 0.85,
                  }}
                />
              </Source>
              <Source id="rwanda" type="geojson" data={{ ...rwandaPolygon, geometry: { ...rwandaPolygon.geometry, coordinates: rwandaPolygon.geometry.coordinates as unknown as number[][][] } }}>
                <Layer {...rwandaBoundaryLayer} />
              </Source>
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
                    setHighlightedReportId(report._id);
                  }}
                >
                  {/* Color-coded SVG pin, highlight if selected */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill={urgencyColors[report.urgency] || '#888'} stroke={highlightedReportId === report._id ? '#22c55e' : '#fff'} strokeWidth="3" />
                    <circle cx="12" cy="12" r="5" fill="#fff" />
                    {highlightedReportId === report._id && (
                      // Custom SVG path for a location pin (green)
                      <g>
                        <path d="M12 7a4 4 0 0 0-4 4c0 2.5 4 6 4 6s4-3.5 4-6a4 4 0 0 0-4-4zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="#22c55e" stroke="#166534" strokeWidth="0.5" />
                      </g>
                    )}
                  </svg>
                </Marker>
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
                <th className="px-3 py-2 text-left">Location Name</th>
                <th className="px-3 py-2 text-left">GPS Coordinates</th>
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
                <tr key={report._id} className={`border-b hover:bg-gray-50 ${highlightedReportId === report._id ? 'bg-green-100' : ''}`}>
                  <td className="px-3 py-2 capitalize">
                    <Badge className="capitalize" style={{ background: categoryColors[report.category], color: 'white' }}>{report.category.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge className="capitalize" style={{ background: urgencyColors[report.urgency], color: '#fff' }}>{report.urgency}</Badge>
                  </td>
                  <td className="px-3 py-2 capitalize">{report.status}</td>
                  <td className="px-3 py-2">{report.location.name}</td>
                  <td className="px-3 py-2">
                    <button
                      className="text-blue-700 underline flex items-center gap-1"
                      onClick={() => setHighlightedReportId(report._id)}
                      title="Show on Map"
                    >
                      {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
                    </button>
                  </td>
                  <td className="px-3 py-2">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{report.submittedBy?.firstName || 'Unknown'}</td>
                  <td className="px-3 py-2" style={{whiteSpace: 'pre-line'}}>{report.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
} 