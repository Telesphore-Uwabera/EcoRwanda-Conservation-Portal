import React, { useState, useEffect } from "react";
import { Users, Plus, Send } from "lucide-react";
import api from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface Comment {
  _id: string;
  user: { firstName: string; lastName: string };
  text: string;
  createdAt: string;
}

interface Thread {
  _id: string;
  title: string;
  description: string;
  createdBy: { firstName: string; lastName: string };
  createdAt: string;
  comments: Comment[];
}

export default function Collaboration() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const fetchThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/collaboration");
      setThreads(res.data.threads || []);
      if (!selected && res.data.threads.length > 0) setSelected(res.data.threads[0]._id);
    } catch (err) {
      setError("Failed to load threads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleCreateThread = async () => {
    if (!newTitle.trim()) return;
    setPosting(true);
    setError(null);
    try {
      await api.post("/collaboration", { title: newTitle, description: newDesc });
      setNewTitle("");
      setNewDesc("");
      fetchThreads();
    } catch (err) {
      setError("Failed to create thread.");
    } finally {
      setPosting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selected) return;
    setPosting(true);
    setError(null);
    try {
      await api.post(`/collaboration/${selected}/comment`, { text: comment });
      setComment("");
      fetchThreads();
    } catch (err) {
      setError("Failed to add comment.");
    } finally {
      setPosting(false);
    }
  };

  const selectedThread = threads.find((t) => t._id === selected);

  return (
    <div className="p-8 flex flex-col items-center min-h-[60vh]">
      <Users className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-center">Team Collaboration</h1>
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 mt-6">
        {/* Thread List */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="h-5 w-5" /> New Thread</h2>
          <input
            className="w-full border rounded px-3 py-2 mb-2"
            placeholder="Thread title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={posting}
          />
          <textarea
            className="w-full border rounded px-3 py-2 mb-2"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            disabled={posting}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold w-full mb-4"
            onClick={handleCreateThread}
            disabled={posting}
          >
            Create Thread
          </button>
          <h2 className="text-lg font-semibold mb-2">Threads</h2>
          {loading ? (
            <div className="text-gray-400">Loading threads...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : threads.length === 0 ? (
            <div className="text-gray-400">No threads yet. Create one above!</div>
          ) : (
            <ul>
              {threads.map((t) => (
                <li
                  key={t._id}
                  className={`p-2 rounded cursor-pointer mb-1 ${selected === t._id ? "bg-green-100 font-bold" : "hover:bg-green-50"}`}
                  onClick={() => setSelected(t._id)}
                >
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Thread Details */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-4">
          {selectedThread ? (
            <>
              <h2 className="text-xl font-bold mb-2">{selectedThread.title}</h2>
              <p className="text-gray-600 mb-4">{selectedThread.description}</p>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Comments</h3>
                {selectedThread.comments.length === 0 ? (
                  <div className="text-gray-400">No comments yet.</div>
                ) : (
                  <ul>
                    {selectedThread.comments.map((c) => (
                      <li key={c._id} className="mb-2">
                        <span className="font-semibold text-green-700">{c.user?.firstName} {c.user?.lastName}:</span> {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  disabled={posting}
                />
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-1"
                  onClick={handleAddComment}
                  disabled={posting}
                >
                  <Send className="h-4 w-4" /> Post
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-400">Select a thread to view details.</div>
          )}
        </div>
      </div>
    </div>
  );
} 