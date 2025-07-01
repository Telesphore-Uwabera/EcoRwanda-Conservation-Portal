import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, MapPin, Tag, User, ArrowLeft } from 'lucide-react';

interface Dataset {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: { lat: number; lng: number; name: string };
  accessLevel: string;
  tags: string[];
  createdAt: string;
  downloads: number;
  featured?: boolean;
  owner?: { name: string; email: string };
  downloadUrl?: string;
}

export default function DatasetDetails() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/data-hub/datasets/${id}`);
        if (res.data.success) {
          setDataset(res.data.data);
        } else {
          setError('Dataset not found.');
        }
      } catch (err) {
        setError('Failed to load dataset.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDataset();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading dataset...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!dataset) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button asChild variant="outline" className="mb-6 flex items-center gap-2">
        <Link to="/researcher/data-hub">
          <ArrowLeft className="h-4 w-4" /> Back to Data Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{dataset.title}</CardTitle>
          <CardDescription>{dataset.category}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {dataset.location?.name || 'N/A'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dataset.createdAt ? new Date(dataset.createdAt).toLocaleString() : 'N/A'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {dataset.downloads.toLocaleString()} Downloads
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Access: {dataset.accessLevel}
            </Badge>
            {dataset.owner && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Owner: {dataset.owner.name}
                {dataset.owner.email && (
                  <span className="ml-1 text-xs text-gray-500">({dataset.owner.email})</span>
                )}
              </Badge>
            )}
            {dataset.featured && (
              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
            )}
          </div>
          <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Description:</b> {dataset.description}</div>
          {dataset.tags && dataset.tags.length > 0 && (
            <div className="mb-2 text-gray-800">
              <b>Tags:</b>
              <div className="flex flex-wrap gap-2 mt-1">
                {dataset.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {dataset.downloadUrl && (
            <Button 
              onClick={() => {
                // Download logic can be added here if needed
              }}
              className="flex items-center gap-2 mt-4"
            >
              <Download className="h-4 w-4" />
              Download Dataset
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 