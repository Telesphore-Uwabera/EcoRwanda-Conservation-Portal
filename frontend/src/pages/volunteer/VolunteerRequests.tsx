import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VolunteerRequest {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  location: {
    name: string;
  };
  startDate: string;
  endDate: string;
  numberOfVolunteersNeeded: number;
  status: string;
  requestedBy: {
    name: string;
  };
}

export default function VolunteerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/volunteer-requests?status=${activeTab === 'all' ? '' : activeTab}`);
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

  const handleApply = async (requestId: string) => {
    try {
      const response = await fetch(`/api/volunteer-requests/${requestId}/apply`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to apply');
      }

      toast.success('Application submitted successfully');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error('Failed to submit application');
      console.error(error);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Volunteer Requests</h1>
        <Input
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <Badge variant={request.status === 'open' ? 'default' : 'secondary'}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{request.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-semibold">Location:</span> {request.location.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Duration:</span>{' '}
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Volunteers Needed:</span>{' '}
                      {request.numberOfVolunteersNeeded}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Requested By:</span> {request.requestedBy.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {request.status === 'open' && (
                    <Button
                      onClick={() => handleApply(request._id)}
                    >
                      Apply Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 