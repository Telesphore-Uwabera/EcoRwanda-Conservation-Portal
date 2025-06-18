import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import api from "@/config/api";

export default function RangerAnalytics() {
  const [patrolsByDay, setPatrolsByDay] = useState<{ _id: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const storedUser = localStorage.getItem('eco-user');
        let token = null;
        if (storedUser) {
          const user = JSON.parse(storedUser);
          token = user.token;
        }
        const response = await api.get('/ranger-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatrolsByDay(response.data.patrolsByDay || []);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <DashboardLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-4">Patrol Analytics</h1>
        {loading ? (
          <p>Loading analytics...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="h-96 bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Patrols Per Day (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={patrolsByDay} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 