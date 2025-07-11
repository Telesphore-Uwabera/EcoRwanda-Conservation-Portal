import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Users, MapPin, Tag, User, ExternalLink, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  owners?: { name: string; email: string }[];
  objectives?: string[];
  teamMembers?: { user?: string; role: string }[];
  documents?: { title: string; description: string; fileUrl: string }[];
  findings?: { title: string; description: string; date?: string }[];
  budget?: { total: number; spent: number; currency: string };
  tags?: string[];
  datasetLinks?: string[];
  publicationLinks?: string[];
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

export default function PublicationDetails() {
  const { id } = useParams<{ id: string }>();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [showDatasetDialog, setShowDatasetDialog] = useState(false);
  const [datasetLoading, setDatasetLoading] = useState(false);

  useEffect(() => {
    const fetchPublication = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/conservation-projects/${id}`);
        if (res.data.success) {
          setPublication(res.data.data);
        } else {
          setError('Publication not found.');
        }
      } catch (err) {
        setError('Failed to load publication.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPublication();
  }, [id]);

  const handleDatasetClick = async (datasetId: string) => {
    setDatasetLoading(true);
    try {
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

  if (loading) return <div className="p-8 text-center">Loading publication...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!publication) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button asChild variant="outline" className="mb-6 flex items-center gap-2">
        <Link to="/researcher/data-hub">
          <ArrowLeft className="h-4 w-4" /> Back to Data Hub
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{publication.title}</CardTitle>
          <CardDescription>{publication.category}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-2 text-sm text-gray-600">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Authors: {publication.authors && publication.authors.length > 0
                ? `${publication.authors.join(", ")} (${(publication.createdBy && typeof publication.createdBy === "object" && publication.createdBy.email) ? publication.createdBy.email : (publication.owners && Array.isArray(publication.owners) && publication.owners.length > 0 && publication.owners[0].email) ? publication.owners[0].email : "N/A"})`
                : (publication.createdBy && typeof publication.createdBy === "object" && publication.createdBy.email)
                  ? publication.createdBy.email
                  : (publication.owners && Array.isArray(publication.owners) && publication.owners.length > 0 && publication.owners[0].email)
                    ? publication.owners[0].email
                    : "N/A"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {publication.createdAt ? new Date(publication.createdAt).toLocaleString() : 'N/A'}
            </Badge>
            {typeof publication.downloads === 'number' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {publication.downloads.toLocaleString()} Downloads
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {publication.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Organization: {publication.organization}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Location: {publication.location}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Required Volunteers: {publication.requiredVolunteers}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Current Volunteers: {publication.currentVolunteers}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Start: {publication.startDate ? new Date(publication.startDate).toLocaleDateString() : 'N/A'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              End: {publication.endDate ? new Date(publication.endDate).toLocaleDateString() : 'N/A'}
            </Badge>
          </div>
          {publication.images && publication.images.length > 0 && (
            <img src={publication.images[0]} alt="Publication" style={{ maxWidth: 300, marginBottom: 12 }} />
          )}
          <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Abstract:</b> {publication.abstract}</div>
          {publication.requirements && <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Requirements:</b> {publication.requirements}</div>}
          {publication.skills && publication.skills.length > 0 && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Skills:</b> {publication.skills.join(', ')}</div>
          )}
          {publication.images && publication.images.length > 0 && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Images:</b> {publication.images.join(', ')}</div>
          )}
          {publication.datasets && publication.datasets.length > 0 && (
            <div className="mb-2 text-gray-800">
              <b>Datasets:</b>
              <div className="flex flex-wrap gap-2 mt-1">
                {publication.datasets.map((datasetId, index) => (
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
          {publication.volunteers && publication.volunteers.length > 0 && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Volunteers:</b> {publication.volunteers.join(', ')}</div>
          )}
          {publication.impact && (
            <div className="mb-2 text-gray-800 whitespace-pre-line">
              <b>Impact:</b> Trees Planted: {publication.impact.treesPlanted}, Wildlife Protected: {publication.impact.wildlifeProtected}, Area Restored: {publication.impact.areaRestored}
            </div>
          )}
          {publication.contributors && publication.contributors.length > 0 && (
            <div className="mb-2 text-gray-800 whitespace-pre-line">
              <b>Contributors:</b> {publication.contributors.map((c: any, idx: number) => `${c.name} (${c.role}${c.email ? ', ' + c.email : ''})`).join('; ')}
            </div>
          )}
          <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Organization:</b> {publication.organization}</div>
          <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Location:</b> {publication.location}</div>
          <div className="mb-2 text-gray-800"><b>Created At:</b> {publication.createdAt ? new Date(publication.createdAt).toLocaleString() : 'N/A'}</div>
          <div className="mb-2 text-gray-800"><b>Updated At:</b> {publication.updatedAt ? new Date(publication.updatedAt).toLocaleString() : 'N/A'}</div>
          {/* References */}
          <div>
            <strong>References:</strong> {publication.references && publication.references.length > 0 ? publication.references.join(', ') : '-'}
          </div>
          {/* Keywords */}
          <div>
            <strong>Keywords:</strong> {publication.keywords && publication.keywords.length > 0 ? publication.keywords.join(', ') : '-'}
          </div>
          {/* Supplementary Files */}
          <div>
            <strong>Supplementary Files:</strong> {publication.supplementaryFiles && publication.supplementaryFiles.length > 0 ? publication.supplementaryFiles.join(', ') : '-'}
          </div>
          {publication.doi && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>DOI:</b> {publication.doi}</div>
          )}
          {publication.fundingSource && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Funding Source:</b> {publication.fundingSource}</div>
          )}
          {publication.publicationLink && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Publication Link:</b> <a href={publication.publicationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{publication.publicationLink}</a></div>
          )}
          {/* Objectives */}
          {publication.objectives && publication.objectives.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Objectives:</b> {publication.objectives.join(', ')}</div>
          )}
          {/* Methodology */}
          {publication.methodology && (
            <div className="mb-2 text-gray-800"><b>Methodology:</b> {publication.methodology}</div>
          )}
          {/* Team Members */}
          {publication.teamMembers && publication.teamMembers.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Team Members:</b>
              <ul className="list-disc ml-6">
                {publication.teamMembers.map((tm: any, idx: number) => (
                  <li key={idx}>{tm.user ? `${tm.user} (${tm.role})` : tm.role}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Documents */}
          {publication.documents && publication.documents.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Documents:</b>
              <ul className="list-disc ml-6">
                {publication.documents.map((doc: any, idx: number) => (
                  <li key={idx}>{doc.title} - {doc.description} <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a></li>
                ))}
              </ul>
            </div>
          )}
          {/* Findings */}
          {publication.findings && publication.findings.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Findings:</b>
              <ul className="list-disc ml-6">
                {publication.findings.map((finding: any, idx: number) => (
                  <li key={idx}>{finding.title} - {finding.description} ({finding.date ? new Date(finding.date).toLocaleDateString() : ''})</li>
                ))}
              </ul>
            </div>
          )}
          {/* Budget */}
          {publication.budget && (
            <div className="mb-2 text-gray-800"><b>Budget:</b> Total: {publication.budget.total}, Spent: {publication.budget.spent}, Currency: {publication.budget.currency}</div>
          )}
          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Tags:</b> {publication.tags.join(', ')}</div>
          )}
          {/* Dataset Links */}
          {publication.datasetLinks && publication.datasetLinks.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Dataset Links:</b> {publication.datasetLinks.join(', ')}</div>
          )}
          {/* Publication Links */}
          {publication.publicationLinks && publication.publicationLinks.length > 0 && (
            <div className="mb-2 text-gray-800"><b>Publication Links:</b> {publication.publicationLinks.map((link: string, idx: number) => (
              <span key={idx}><a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link}</a>{idx < publication.publicationLinks.length - 1 ? ', ' : ''}</span>
            ))}</div>
          )}
          {publication.ethicalApproval && (
            <div className="mb-2 text-gray-800 whitespace-pre-line"><b>Ethical Approval:</b> {publication.ethicalApproval}</div>
          )}
        </CardContent>
      </Card>
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
                    onClick={() => {
                      // Download logic can be added here if needed
                    }}
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