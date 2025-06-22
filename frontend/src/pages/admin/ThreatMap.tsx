import React, { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/config/api';

const incidentTypes = ['All', 'Poaching', 'Fire', 'Illegal Logging'];
const severities = ['All', 'High', 'Medium', 'Low'];

export default function ThreatMap() {
  const [reports, setReports] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }
        const res = await api.get('/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setReports(res.data.data);
        } else {
          setError('Failed to load reports.');
        }
      } catch (err) {
        setError('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r =>
    (typeFilter === 'All' || r.category === typeFilter.toLowerCase()) &&
    (severityFilter === 'All' || r.urgency === severityFilter.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading map data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Threat Map</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Incident Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded px-2 py-1">
              {incidentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="border rounded px-2 py-1">
              {severities.map(sev => <option key={sev} value={sev}>{sev}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>
      <div style={{ height: '500px', width: '100%' }}>
        <Map
          initialViewState={{
            longitude: 29.87,
            latitude: -1.95,
            zoom: 8,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          mapLib={import('maplibre-gl')}
        >
          {filteredReports.map(report => {
            // Fallback for marker position
            let lat = report.location?.lat ?? report.lat;
            let lng = report.location?.lng ?? report.lng;
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;
            return (
              <Marker
                key={report._id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setSelectedReport(report);
                }}
              />
            );
          })}
          {selectedReport && (
            <Popup
              longitude={selectedReport.location?.lng ?? selectedReport.lng}
              latitude={selectedReport.location?.lat ?? selectedReport.lat}
              anchor="top"
              onClose={() => setSelectedReport(null)}
              closeOnClick={false}
            >
              <div className="space-y-1">
                <div className="font-bold">{selectedReport.category}</div>
                <Badge>{selectedReport.urgency}</Badge>
                <div><b>Location:</b> {selectedReport.location?.name ?? 'Unknown'}</div>
                <div><b>Date:</b> {selectedReport.submittedAt ? new Date(selectedReport.submittedAt).toLocaleDateString() : 'N/A'}</div>
                <div><b>Reporter:</b> {selectedReport.submittedBy?.firstName || 'Unknown'}</div>
                <div className="text-sm text-gray-700">{selectedReport.description}</div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
} 