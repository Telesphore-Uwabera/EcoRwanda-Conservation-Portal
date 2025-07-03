import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/config/api';
import { Loader2, AlertCircle, Inbox, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface Application {
  _id: string;
  volunteerRequest: {
    _id: string;
    title: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/applications/my-applications');
        if (response.data.success) {
          setApplications(Array.isArray(response.data.data) ? response.data.data : []);
        } else {
          setError(response.data.error || 'Failed to fetch applications.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'An error occurred while fetching applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
        case 'accepted':
          return <Check className="h-4 w-4 mr-2" />;
        case 'rejected':
          return <X className="h-4 w-4 mr-2" />;
        case 'pending':
        default:
          return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
      }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!Array.isArray(applications) || applications.length === 0) {
      return (
        <div className="text-center py-16">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-semibold">No Applications Found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't applied to any projects yet.</p>
        </div>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
                {Array.isArray(applications) && applications
                  .filter(app => app && app._id && app.volunteerRequest && app.volunteerRequest._id)
                  .map((app) => (
                    <li key={app._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="mb-2 sm:mb-0">
                            <Link to={`/volunteer/request/${app.volunteerRequest._id}`} className="font-semibold text-lg hover:underline">
                                {app.volunteerRequest.title}
                            </Link>
                            <p className="text-sm text-gray-500">Submitted on: {format(new Date(app.submittedAt), 'PPP')}</p>
                        </div>
                        <Badge variant={getStatusVariant(app.status)} className="flex items-center">
                           {getStatusIcon(app.status)}
                           <span className="capitalize">{app.status}</span>
                        </Badge>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-gray-600">Track the status of volunteer applications.</p>
      </div>
      {renderContent()}
    </div>
  );
} 