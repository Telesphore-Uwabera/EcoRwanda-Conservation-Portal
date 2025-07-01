import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, Users, FolderOpen, Clock, Zap } from 'lucide-react';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { useOfflineStatus } from '@/lib/offline';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';
import Analytics from './Analytics';

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
    verifiedReportsThisMonth: number;
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
      <div className="container mx-auto p-4">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2 mb-6">
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
          <Analytics analytics={stats} />
        )}
      </div>
  );
} 