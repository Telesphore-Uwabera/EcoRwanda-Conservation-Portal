import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
}

// Define colors for each threat category for consistent styling
const categoryColors: { [key: string]: string } = {
  poaching: "red",
  habitat_destruction: "orange",
  wildlife_sighting: "blue",
  human_wildlife_conflict: "purple",
  other: "gray",
};

// Create custom colored icons for the map pins
const getIcon = (L: any, color: string) => {
  if (!L) return null;
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export default function ThreatMap() {
  const [reports, setReports] = useState<WildlifeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WildlifeReport[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-1.9441, 29.8739]);

  // Use refs to hold the dynamically imported libraries
  const leafletRef = useRef<any>({
    MapContainer: null,
    TileLayer: null,
    Marker: null,
    Popup: null,
    useMap: null,
    L: null,
  });
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Dynamically import libraries only on the client side
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([{ MapContainer, TileLayer, Marker, Popup, useMap }, L]) => {
      leafletRef.current = { MapContainer, TileLayer, Marker, Popup, useMap, L: L.default };
      setMapReady(true);
    });
  }, []);

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

    if (newFilteredReports.length > 0) {
      const { lat, lng } = newFilteredReports[0].location;
      setMapCenter([lat, lng]);
    } else {
      setMapCenter([-1.9441, 29.8739]); // Reset to default if no reports
    }
  }, [categoryFilter, statusFilter, reports]);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  // Destructure the components from the ref
  const { MapContainer, TileLayer, Marker, Popup, useMap, L } = leafletRef.current;

  // Render nothing until the map is ready
  if (!mapReady || !MapContainer) {
    return (
      <div style={{ height: "600px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading Map...
      </div>
    );
  }

  // useMap requires to be a child of MapContainer, so we create a helper component
  const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapIcon /> Threat Map
        </h1>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <Select onValueChange={setCategoryFilter} defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(categoryColors).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
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
      </div>

      <Card>
        <CardContent className="p-0">
          <MapContainer
            center={mapCenter}
            zoom={8}
            style={{ height: "600px", width: "100%" }}
          >
            <ChangeView center={mapCenter} zoom={filteredReports.length > 0 ? 10 : 8} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredReports.map((report) => (
              <Marker
                key={report._id}
                position={[report.location.lat, report.location.lng]}
                icon={getIcon(L, categoryColors[report.category] || "gray")}
              >
                <Popup>
                  <div className="font-bold">{report.title}</div>
                  <p>{report.description}</p>
                  <Badge>{report.category}</Badge>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(report.createdAt).toLocaleString()}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </CardContent>
      </Card>
    </div>
  );
}
