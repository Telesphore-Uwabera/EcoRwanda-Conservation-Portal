import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface VolunteerRequest {
  _id: string;
  title: string;
  description: string;
  status: string;
  numberOfVolunteersNeeded: number;
  applicants: {
    _id: string;
    name: string;
    email: string;
    skills: string[];
  }[];
  acceptedVolunteers: string[];
}

export default function ManageVolunteerRequests() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/volunteer-requests/my-requests?status=${activeTab === 'all' ? '' : activeTab}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to fetch volunteer requests');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplication = async (requestId: string, applicantId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/volunteer-requests/${requestId}/handle-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: applicantId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to handle application');
      }

      toast.success(`Application ${action}ed successfully`);
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${action} application`);
      console.error(error);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/volunteer-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      toast.success('Request status updated successfully');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update request status');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Volunteer Requests</h1>
        <Button>Create New Request</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                      <Select
                        value={request.status}
                        onValueChange={(value) => updateRequestStatus(request._id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Applicants ({request.applicants.length})</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {request.applicants.map((applicant) => (
                          <TableRow key={applicant._id}>
                            <TableCell>{applicant.name}</TableCell>
                            <TableCell>{applicant.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {applicant.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApplication(request._id, applicant._id, 'accept')}
                                  disabled={request.acceptedVolunteers.includes(applicant._id)}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApplication(request._id, applicant._id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <p>Volunteers Needed: {request.numberOfVolunteersNeeded}</p>
                    <p>Accepted: {request.acceptedVolunteers.length}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 