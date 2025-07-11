import React, { useEffect, useState } from "react";
import api from "@/config/api";
import { Megaphone, Trash2 } from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  audience: string;
}

const audienceOptions = [
  { value: "all", label: "All Users" },
  { value: "rangers", label: "Rangers Only" },
  { value: "admins", label: "Admins Only" },
];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", message: "", audience: "all" });
  const [posting, setPosting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setSuccess(null);
    setError(null);
    try {
      await api.post("/announcements", form);
      setForm({ title: "", message: "", audience: "all" });
      setSuccess("Announcement posted!");
      fetchAnnouncements();
    } catch (err) {
      setError("Failed to post announcement.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch {
      setError("Failed to delete announcement.");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Admin Announcements</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-8 border border-yellow-200">
        <h2 className="text-xl font-semibold mb-3">Post New Announcement</h2>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} required className="w-full border rounded px-3 py-2 min-h-[80px]" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Audience</label>
          <select name="audience" value={form.audience} onChange={handleChange} className="w-full border rounded px-3 py-2">
            {audienceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold" disabled={posting}>
          {posting ? "Posting..." : "Post Announcement"}
        </button>
        {success && <p className="text-green-600 mt-2">{success}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
      {loading ? (
        <p>Loading announcements...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center mt-16">
          <Megaphone className="h-16 w-16 text-yellow-200 mb-4" />
          <p className="text-gray-500 text-lg">No announcements yet. Post one above!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((a) => (
            <div key={a._id} className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-400 relative">
              <button onClick={() => handleDelete(a._id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700" title="Delete">
                <Trash2 className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold mb-1">{a.title}</h2>
              <p className="text-gray-700 mb-2">{a.message}</p>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>By {a.createdBy?.firstName} {a.createdBy?.lastName}</span>
                <span>•</span>
                <span>{new Date(a.createdAt).toLocaleString()}</span>
                <span>•</span>
                <span className="capitalize">{a.audience}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 