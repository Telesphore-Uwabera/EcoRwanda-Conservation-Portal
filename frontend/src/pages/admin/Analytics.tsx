import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderOpen, Clock, Zap, BarChart, PieChart, CheckSquare, Activity } from 'lucide-react';

interface AnalyticsProps {
  analytics: any; 
}

const Analytics: React.FC<AnalyticsProps> = ({ analytics }) => {
  if (!analytics) return null;

  const { userStats, activityStats, projectStats, engagementStats } = analytics;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Total Users" value={userStats.totalUsers} />
        <StatCard icon={CheckSquare} title="Verified Reports" value={activityStats.verifiedReports} />
        <StatCard icon={Activity} title="Completed Patrols" value={activityStats.completedPatrols} />
      </div>

      {/* User Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <UserStat label="Volunteers" value={userStats.userDistribution.volunteers} />
            <UserStat label="Researchers" value={userStats.userDistribution.researchers} />
            <UserStat label="Rangers" value={userStats.userDistribution.rangers} />
            <UserStat label="Admins" value={userStats.userDistribution.administrators} />
          </div>
        </CardContent>
      </Card>

      {/* Activity Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Reports: {activityStats.totalReports}</p>
            <p>Pending Reports: {activityStats.pendingReports}</p>
            <p>Verified This Month: {activityStats.verifiedReportsThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patrol Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Patrols: {activityStats.totalPatrols}</p>
            <p>Completed Patrols: {activityStats.completedPatrols}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-gray-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{(value ?? 0).toLocaleString()}</div>
    </CardContent>
  </Card>
);

const UserStat = ({ label, value }) => (
  <div>
    <p className="text-2xl font-bold">{(value ?? 0).toLocaleString()}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

export default Analytics; 