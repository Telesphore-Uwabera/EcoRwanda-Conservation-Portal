import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, Users, FolderOpen, Clock, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { useOfflineStatus } from '@/lib/offline';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';

interface AnalyticsStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userDistribution: {
      volunteers: number;
      researchers: number;
      rangers: number;
      administrators: number;
    };
  };
  activityStats: {
    totalReports: number;
    verifiedReports: number;
    pendingReports: number;
    totalPatrols: number;
    completedPatrols: number;
  };
  projectStats: {
    activeProjects: number;
    completedProjects: number;
    totalResearchStudies: number;
    conservationAreas: number;
  };
  engagementStats: {
    averageResponseTime: string;
    reportAccuracy: string;
    userSatisfaction: string;
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.get('/analytics');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'administrator' && isOnline) {
      fetchAnalytics();
    }
  }, [user, isOnline]);

  return (
    <DashboardLayout>
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-blue-600" />
            System Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into user activities, projects, and reports.
          </p>
        </div>

        {loading && <p>Loading analytics data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-gray-500">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projectStats.activeProjects.toLocaleString()}</div>
                <p className="text-xs text-gray-500">+15% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activityStats.pendingReports.toLocaleString()}</div>
                <p className="text-xs text-gray-500">-5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Patrols</CardTitle>
                <Zap className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activityStats.completedPatrols.toLocaleString()}</div>
                <p className="text-xs text-gray-500">+10% from last month</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 