import React, { useEffect, useState } from "react";
import api from "@/config/api";
import { Megaphone } from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  audience: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/announcements");
        setAnnouncements(res.data.announcements || []);
      } catch (err) {
        setError("Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Announcements</h1>
      </div>
      {loading ? (
        <p>Loading announcements...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center mt-16">
          <Megaphone className="h-16 w-16 text-yellow-200 mb-4" />
          <p className="text-gray-500 text-lg">No announcements yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((a) => (
            <div key={a._id} className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-400">
              <h2 className="text-xl font-semibold mb-1">{a.title}</h2>
              <p className="text-gray-700 mb-2">{a.message}</p>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>By {a.createdBy?.firstName} {a.createdBy?.lastName}</span>
                <span>•</span>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 