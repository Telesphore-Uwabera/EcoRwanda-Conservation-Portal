import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import api from '@/config/api';

export default function ResearcherApplicationDetails() {
  const { requestId, applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHandling, setIsHandling] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/applications/${applicationId}`);
        if (response.data.success) {
          setApplication(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch application.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred while fetching application.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId]);

  const handleAction = async (action: 'accept' | 'reject') => {
    setIsHandling(true);
    try {
      await api.post(`/volunteer-requests/handle-application`, { applicationId, action });
      setApplication((prev: any) => prev ? { ...prev, status: action === 'accept' ? 'accepted' : 'rejected' } : prev);
    } catch (err) {
      // Optionally show error
    } finally {
      setIsHandling(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!application) return <div className="p-4">Application not found.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">Applicant:</span> {application.applicant ? `${application.applicant.firstName} ${application.applicant.lastName}` : 'Unknown'}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {application.applicant ? application.applicant.email : ''}
          </div>
          <div>
            <span className="font-semibold">Cover Letter:</span>
            <p className="mt-1 whitespace-pre-wrap">{application.coverLetter}</p>
          </div>
          {application.portfolioLink && (
            <div>
              <span className="font-semibold">Portfolio:</span> <a href={application.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.portfolioLink}</a>
            </div>
          )}
          <div>
            <span className="font-semibold">Status:</span> <Badge variant={application.status === 'accepted' ? 'default' : application.status === 'rejected' ? 'destructive' : 'secondary'}>{application.status}</Badge>
          </div>
          {application.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => handleAction('reject')} disabled={isHandling}>Reject</Button>
              <Button onClick={() => handleAction('accept')} disabled={isHandling}>Accept</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 