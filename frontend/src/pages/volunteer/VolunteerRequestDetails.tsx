import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Target,
  Award,
  BookOpen,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RequestDetails {
  _id: string;
  title: string;
  description: string;
  objectives: string[];
  location: { name: string };
  startDate: string;
  endDate: string;
  timeCommitment: string;
  numberOfVolunteersNeeded: number;
  skillsRequired: string[];
  preferredSkills: string[];
  difficultyLevel: string;
  compensation: string;
  trainingProvided: boolean;
  accommodationProvided: boolean;
  transportationProvided: boolean;
  status: 'open' | 'closed';
  applicants: string[];
  researchProject: {
    title: string;
  };
}

export default function VolunteerRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'success' | 'error' | null>(null);
  const [applicationError, setApplicationError] = useState('');
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  const alreadyApplied = request && user && request.applicants.includes(user._id);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/volunteer-requests/${id}`);
        if (response.data.success) {
          setRequest(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch volunteer opportunity.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleApply = async () => {
    setIsApplying(true);
    setApplicationStatus(null);
    setApplicationError('');
    try {
      const response = await api.post(`/volunteer-requests/${id}/apply`, { coverLetter, portfolioLink });
      if (response.data.success) {
        setApplicationStatus('success');
        // Refresh data to show updated applicant list
        setRequest(prev => prev ? { ...prev, applicants: [...prev.applicants, user!._id] } : null);
        setOpen(false); // Close dialog on success
      } else {
        throw new Error(response.data.error || "Application failed.");
      }
    } catch (err: any) {
      setApplicationStatus('error');
      setApplicationError(err.response?.data?.error || err.message || 'An unknown error occurred.');
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
    );
  }

  if (!request) {
    return (
        <div className="p-4 text-center">Opportunity not found.</div>
    );
  }

  return (
      <div className="container mx-auto p-4 md:p-6">
      <Link to="/volunteer/projects" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to all opportunities
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Badge variant={request.status === 'open' ? 'default' : 'destructive'} className="w-fit mb-2">{request.status}</Badge>
                <CardTitle className="text-3xl">{request.title}</CardTitle>
                <CardDescription>
                  Part of the larger research initiative: <span className="font-semibold">{request.researchProject.title}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{request.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600" /> Key Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {request.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-emerald-600" /> Skills & Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {request.skillsRequired.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {request.preferredSkills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" /> Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-gray-600">Location</span>
                  <span className="text-right flex items-center gap-1"><MapPin className="h-4 w-4" />{request.location.name}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-gray-600">Dates</span>
                  <span className="text-right flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(request.startDate)} - {formatDate(request.endDate)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-gray-600">Commitment</span>
                  <span className="text-right flex items-center gap-1"><Clock className="h-4 w-4" />{request.timeCommitment} hrs/week</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-gray-600">Slots Open</span>
                  <span className="text-right flex items-center gap-1"><Users className="h-4 w-4" />{request.numberOfVolunteersNeeded}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-gray-600">Difficulty</span>
                  <span className="text-right capitalize">{request.difficultyLevel}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-emerald-600" /> Apply Now</CardTitle>
              </CardHeader>
              <CardContent>
                {applicationStatus === 'success' ? (
                  <Alert className="bg-emerald-50 border-emerald-300">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertTitle className="text-emerald-800">Application Sent!</AlertTitle>
                    <AlertDescription className="text-emerald-700">The researcher has received the application.</AlertDescription>
                  </Alert>
                ) : (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={alreadyApplied}>
                        {alreadyApplied ? 'Already Applied' : 'Submit My Application'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Apply for: {request.title}</DialogTitle>
                        <DialogDescription>
                          Submit the application by filling out the form below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cover-letter">Cover Letter</Label>
                          <Textarea
                            id="cover-letter"
                            placeholder="Explain why you're a great fit for this role..."
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={8}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="portfolio-link">Portfolio Link (Optional)</Label>
                          <Input
                            id="portfolio-link"
                            placeholder="https://portfolio-link.com"
                            value={portfolioLink}
                            onChange={(e) => setPortfolioLink(e.target.value)}
                          />
                        </div>
                        {applicationStatus === 'error' && (
                           <Alert variant="destructive">
                              <XCircle className="h-4 w-4" />
                              <AlertTitle>Application Failed</AlertTitle>
                              <AlertDescription>{applicationError}</AlertDescription>
                            </Alert>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleApply} disabled={isApplying || !coverLetter}>
                          {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit Application
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
} 