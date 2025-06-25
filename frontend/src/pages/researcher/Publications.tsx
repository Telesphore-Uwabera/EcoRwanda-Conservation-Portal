import React, { useEffect, useState } from 'react';
import api from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Users } from 'lucide-react';
import { toast } from "sonner";

interface Publication {
  _id: string;
  title: string;
  authors: string[];
  publicationDate?: string;
  abstract?: string;
  category?: string;
  downloads?: number;
  accessLevel: string;
}

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/conservation-projects/publications');
        if (res.data.success) {
          setPublications(res.data.data);
        } else {
          setError('Failed to load publications.');
        }
      } catch (err) {
        setError('Failed to load publications.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading publications...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Research Publications</h1>
      {publications.length === 0 ? (
        <div className="text-gray-500 text-center">No publications found.</div>
      ) : (
        <div className="grid gap-6">
          {publications.map(pub => (
            <Card key={pub._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{pub.title}</CardTitle>
                <CardDescription>{pub.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {pub.authors?.join(', ') || 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {pub.publicationDate ? new Date(pub.publicationDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                  {typeof pub.downloads === 'number' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {pub.downloads.toLocaleString()} Downloads
                    </Badge>
                  )}
                </div>
                {pub.accessLevel === 'open' ? (
                  <div className="text-gray-800 mb-2">{pub.abstract || 'No abstract provided.'}</div>
                ) : pub.accessLevel === 'restricted' ? (
                  <div className="text-red-600 font-semibold mb-2">Access Restricted</div>
                ) : (
                  <div className="mb-2">
                    <div className="text-amber-700 font-semibold mb-2">Access available upon request</div>
                    {requestingId === pub._id ? (
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          toast.success('Access request sent!');
                          setRequestingId(null);
                          setRequestMessage("");
                        }}
                        className="flex flex-col gap-2"
                      >
                        <textarea
                          className="border rounded p-2"
                          placeholder="Enter your request message"
                          value={requestMessage}
                          onChange={e => setRequestMessage(e.target.value)}
                          required
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded">Send Request</button>
                          <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setRequestingId(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="bg-amber-600 text-white px-3 py-1 rounded"
                        onClick={() => setRequestingId(pub._id)}
                      >
                        Request Access
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 