import React, { useEffect, useState } from 'react';
import api from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Calendar, Users, MapPin, Tag, User, ExternalLink } from 'lucide-react';
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
  description?: string;
  organization?: string;
  location?: string;
  requiredVolunteers?: number;
  currentVolunteers?: number;
  startDate?: string;
  endDate?: string;
  skills?: string[];
  requirements?: string;
  images?: string[];
  datasets?: string[];
  impact?: {
    treesPlanted: number;
    wildlifeProtected: number;
    areaRestored: number;
  };
  contributors?: { name: string; role: string; email?: string }[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  references?: string[];
  keywords?: string[];
  supplementaryFiles?: string[];
  doi?: string;
  fundingSource?: string;
  publicationLink?: string;
  methodology?: string;
  ethicalApproval?: string;
  volunteers?: string[];
  createdBy?: { name?: string; email?: string } | string;
  owners?: { name?: string; email?: string }[];
}

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

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  
  // Dataset dialog state
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showDatasetDialog, setShowDatasetDialog] = useState(false);
  const [datasetLoading, setDatasetLoading] = useState(false);

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

  const handleDatasetClick = async (datasetId: string) => {
    setDatasetLoading(true);
    try {
      // Fetch dataset details by ID
      const response = await api.get(`/data-hub/datasets/${datasetId}`);
      if (response.data.success && response.data.data) {
        setSelectedDataset(response.data.data);
        setShowDatasetDialog(true);
      } else {
        toast.error('Dataset not found');
      }
    } catch (err) {
      toast.error('Failed to load dataset details');
    } finally {
      setDatasetLoading(false);
    }
  };

  const handleDownloadDataset = async (dataset: Dataset) => {
    try {
      const storedUser = localStorage.getItem('eco-user');
      let token = null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        token = user.token;
      }
      const res = await api.get(`/data-hub/datasets/${dataset._id}/download`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataset.title?.replace(/\s+/g, '_') || 'dataset'}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Dataset downloaded!');
    } catch (err) {
      toast.error('Failed to download dataset');
    }
  };

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
            <Card key={pub._id} className="hover:shadow-md transition-shadow p-6">
              <CardHeader>
                <CardTitle>{pub.title}</CardTitle>
                <CardDescription>{pub.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Authors: {pub.authors && pub.authors.length > 0
                      ? `${pub.authors.join(", ")}${(pub.createdBy && typeof pub.createdBy === "object" && pub.createdBy.email) ? ` (${pub.createdBy.email})` : (pub.owners && Array.isArray(pub.owners) && pub.owners.length > 0 && pub.owners[0].email) ? ` (${pub.owners[0].email})` : ""}`
                      : (pub.createdBy && typeof pub.createdBy === "object" && pub.createdBy.email)
                        ? pub.createdBy.email
                        : (pub.owners && Array.isArray(pub.owners) && pub.owners.length > 0 && pub.owners[0].email)
                          ? pub.owners[0].email
                          : ""}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {pub.createdAt ? new Date(pub.createdAt).toLocaleString() : 'N/A'}
                  </Badge>
                  {typeof pub.downloads === 'number' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {pub.downloads.toLocaleString()} Downloads
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    Status: {pub.status}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Access: {pub.accessLevel}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Organization: {pub.organization}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Location: {pub.location}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Required Volunteers: {pub.requiredVolunteers}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Current Volunteers: {pub.currentVolunteers}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    Start: {pub.startDate ? new Date(pub.startDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    End: {pub.endDate ? new Date(pub.endDate).toLocaleDateString() : 'N/A'}
                  </Badge>
                </div>
                {pub.images && pub.images.length > 0 && (
                  <img src={pub.images[0]} alt="Publication" style={{ maxWidth: 200, marginBottom: 8 }} />
                )}
                <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Abstract:</span> {pub.abstract}</div>
                <div className="space-y-4">
                  <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Description:</span> {pub.description}</div>
                  {pub.requirements && <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Requirements:</span> {pub.requirements}</div>}
                  {pub.skills && pub.skills.length > 0 && (
                    <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Skills:</span> {pub.skills.join(', ')}</div>
                  )}
                  {pub.images && pub.images.length > 0 && (
                    <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Images:</span> {pub.images.join(', ')}</div>
                  )}
                  {pub.datasets && pub.datasets.length > 0 && (
                    <div className="text-gray-800">
                      <span className="font-semibold">Datasets:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pub.datasets.map((datasetId, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDatasetClick(datasetId)}
                            disabled={datasetLoading}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {datasetId}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pub.volunteers && pub.volunteers.length > 0 && (
                    <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Volunteers:</span> {pub.volunteers.join(', ')}</div>
                  )}
                  {pub.impact && (
                    <div className="text-gray-800 whitespace-pre-line">
                      <span className="font-semibold">Impact:</span> Trees Planted: {pub.impact.treesPlanted}, Wildlife Protected: {pub.impact.wildlifeProtected}, Area Restored: {pub.impact.areaRestored}
                    </div>
                  )}
                  {pub.contributors && pub.contributors.length > 0 && (
                    <div className="text-gray-800 whitespace-pre-line">
                      <span className="font-semibold">Contributors:</span> {pub.contributors.map((c: any, idx: number) => `${c.name} (${c.role}${c.email ? ', ' + c.email : ''})`).join('; ')}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Organization:</span> {pub.organization}</div>
                      <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Location:</span> {pub.location}</div>
                      <div className="text-gray-800"><span className="font-semibold">Created At:</span> {pub.createdAt ? new Date(pub.createdAt).toLocaleString() : 'N/A'}</div>
                      <div className="text-gray-800"><span className="font-semibold">Updated At:</span> {pub.updatedAt ? new Date(pub.updatedAt).toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="space-y-2">
                      {pub.references && pub.references.length > 0 && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">References:</span> {pub.references.join(', ')}</div>
                      )}
                      {pub.keywords && pub.keywords.length > 0 && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Keywords:</span> {pub.keywords.join(', ')}</div>
                      )}
                      {pub.supplementaryFiles && pub.supplementaryFiles.length > 0 && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Supplementary Files:</span> {pub.supplementaryFiles.join(', ')}</div>
                      )}
                      {pub.doi && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">DOI:</span> {pub.doi}</div>
                      )}
                      {pub.fundingSource && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Funding Source:</span> {pub.fundingSource}</div>
                      )}
                      {pub.publicationLink && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Publication Link:</span> <a href={pub.publicationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{pub.publicationLink}</a></div>
                      )}
                      {pub.methodology && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Methodology:</span> {pub.methodology}</div>
                      )}
                      {pub.ethicalApproval && (
                        <div className="text-gray-800 whitespace-pre-line"><span className="font-semibold">Ethical Approval:</span> {pub.ethicalApproval}</div>
                      )}
                    </div>
                  </div>
                  <div className="border-b my-4"></div>
                  {pub.accessLevel === 'open' ? null : pub.accessLevel === 'restricted' ? (
                    <div className="text-red-600 font-semibold">Access Restricted</div>
                  ) : (
                    <div>
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
                            placeholder="Enter a request message"
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dataset Dialog */}
      <Dialog open={showDatasetDialog} onOpenChange={setShowDatasetDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Dataset Details
            </DialogTitle>
          </DialogHeader>
          {selectedDataset && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedDataset.title}</h3>
                <p className="text-gray-600">{selectedDataset.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Category:</span>
                    <Badge variant="outline">{selectedDataset.category}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Location:</span>
                    <span>{selectedDataset.location.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Downloads:</span>
                    <span>{selectedDataset.downloads}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Created:</span>
                    <span>{new Date(selectedDataset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Access Level:</span>
                    <Badge variant={selectedDataset.accessLevel === 'open' ? 'default' : 'secondary'}>
                      {selectedDataset.accessLevel}
                    </Badge>
                  </div>
                  
                  {selectedDataset.owner && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Owner:</span>
                      <span>{selectedDataset.owner.name}</span>
                    </div>
                  )}
                  
                  {selectedDataset.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                  )}
                </div>
              </div>
              
              {selectedDataset.tags && selectedDataset.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDataset.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t">
                {selectedDataset.downloadUrl && (
                  <Button 
                    onClick={() => handleDownloadDataset(selectedDataset)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Dataset
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowDatasetDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
