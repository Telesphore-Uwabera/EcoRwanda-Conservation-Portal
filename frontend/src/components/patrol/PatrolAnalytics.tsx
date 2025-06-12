import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Patrol } from "@/types/patrol";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface PatrolAnalyticsProps {
  patrols: Patrol[];
}

export function PatrolAnalytics({ patrols }: PatrolAnalyticsProps) {
  const [timeRange, setTimeRange] = React.useState("month");

  // Calculate statistics
  const totalPatrols = patrols.length;
  const completedPatrols = patrols.filter(p => p.status === "completed").length;
  const inProgressPatrols = patrols.filter(p => p.status === "in_progress").length;
  const scheduledPatrols = patrols.filter(p => p.status === "scheduled").length;

  // Prepare data for status distribution pie chart
  const statusData = [
    { name: "Completed", value: completedPatrols },
    { name: "In Progress", value: inProgressPatrols },
    { name: "Scheduled", value: scheduledPatrols },
  ];

  // Prepare data for patrols by priority bar chart
  const priorityData = [
    { name: "High", value: patrols.filter(p => p.priority === "high").length },
    { name: "Medium", value: patrols.filter(p => p.priority === "medium").length },
    { name: "Low", value: patrols.filter(p => p.priority === "low").length },
  ];

  // Calculate average duration
  const totalDuration = patrols.reduce((sum, patrol) => {
    if (patrol.duration) {
      const hours = parseInt(patrol.duration);
      return sum + (isNaN(hours) ? 0 : hours);
    }
    return sum;
  }, 0);
  const averageDuration = totalPatrols > 0 ? (totalDuration / totalPatrols).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patrol Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patrols</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatrols}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPatrols}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressPatrols}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDuration}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patrol Status Distribution</CardTitle>
            <CardDescription>Distribution of patrols by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patrols by Priority</CardTitle>
            <CardDescription>Number of patrols by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Number of Patrols" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 