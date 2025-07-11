import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, CornerDownRight, Edit, Trash2 } from "lucide-react";
import api from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  _id: string;
  user: { _id: string; firstName: string; lastName: string; role: string };
  text: string;
  likes: number;
  unlikes: number;
  replies: ChatMessage[];
  createdAt: string;
  replyTo?: ChatMessage;
  likedBy?: string[];
  unlikedBy?: string[];
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [likedMessages, setLikedMessages] = useState<{ [id: string]: 'like' | 'unlike' | undefined }>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/chat");
      setMessages(res.data.messages || []);
    } catch (err) {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      if (replyTo) {
        await api.post(`/chat/${replyTo._id}/reply`, { text: input });
      } else {
        await api.post("/chat", { text: input });
      }
      setInput("");
      setReplyTo(null);
      await fetchMessages();
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo(msg);
  };

  const handleLike = async (id: string) => {
    const res = await api.post(`/chat/${id}/like`);
    if (res.data && res.data.message) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id ? { ...msg, ...res.data.message } : msg
        )
      );
    } else {
      fetchMessages();
    }
  };

  const handleUnlike = async (id: string) => {
    const res = await api.post(`/chat/${id}/unlike`);
    if (res.data && res.data.message) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id ? { ...msg, ...res.data.message } : msg
        )
      );
    } else {
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await api.delete(`/chat/${id}`);
        fetchMessages();
      } catch (err) {
        setError("Failed to delete message.");
        console.error(err);
      }
    }
  };

  const handleEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg._id);
    setEditingText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await api.put(`/chat/${id}`, { text: editingText });
      setEditingMessageId(null);
      setEditingText("");
      fetchMessages();
    } catch (err) {
      setError("Failed to update message.");
      console.error(err);
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "administrator") return "bg-blue-50 border-blue-400 text-blue-900";
    if (role === "ranger") return "bg-green-50 border-green-400 text-green-900";
    return "bg-gray-50 border-gray-300 text-gray-800";
  };

  return (
    <div className="p-8 flex flex-col items-center min-h-[60vh]">
      <MessageSquare className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-center">Ranger Chat</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mb-6 min-h-[300px] max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
        ) : (
          <div className="space-y-6">
            {Array.isArray(messages) && messages.map((msg) => {
              const liked = msg.likedBy && user && msg.likedBy.some((u: any) => u === user._id || u._id === user._id);
              const unliked = msg.unlikedBy && user && msg.unlikedBy.some((u: any) => u === user._id || u._id === user._id);
              return (
                <div key={msg._id} className="rounded-lg border px-4 py-3 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{msg.user?.firstName} {msg.user?.lastName}</span>
                        <span className="text-xs text-gray-400 ml-2">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</span>
                      </div>
                      {editingMessageId === msg._id ? (
                        <div className="mt-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full border rounded p-2"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleSaveEdit(msg._id)} className="text-sm bg-green-500 text-white px-2 py-1 rounded">Save</button>
                            <button onClick={handleCancelEdit} className="text-sm bg-gray-300 px-2 py-1 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-800 mb-2">{msg.text}</div>
                      )}
                    </div>
                    {user && msg.user && user._id === msg.user._id && (
                      <div className="flex gap-2 text-gray-400">
                        <button onClick={() => handleEdit(msg)}><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(msg._id)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )}
                  </div>

                  {/* Replies */}
                  {Array.isArray(msg.replies) && msg.replies.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {msg.replies.map(reply => (
                        <div key={reply._id} className="ml-8 p-3 rounded border bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{reply.user?.firstName} {reply.user?.lastName}</span>
                                <span className="text-xs text-gray-400 ml-2">{reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ''}</span>
                              </div>
                              <div className="border-l-2 border-green-200 pl-2 text-xs italic text-gray-500 mb-1">
                                Replying to: <span className="font-medium text-gray-700">{msg.text}</span>
                              </div>
                              {editingMessageId === reply._id ? (
                                <div className="mt-2">
                                  <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="w-full border rounded p-2"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleSaveEdit(reply._id)} className="text-sm bg-green-500 text-white px-2 py-1 rounded">Save</button>
                                    <button onClick={handleCancelEdit} className="text-sm bg-gray-300 px-2 py-1 rounded">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-800">{reply.text}</div>
                              )}
                            </div>
                            {user && reply.user && user._id === reply.user._id && (
                              <div className="flex gap-2 text-gray-400">
                                <button onClick={() => handleEdit(reply)}><Edit className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(reply._id)}><Trash2 className="h-4 w-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm mt-3">
                    <button onClick={() => handleReply(msg)} className="flex items-center gap-1 text-gray-500 hover:underline">
                      <CornerDownRight className="h-4 w-4" /> Reply
                    </button>
                    <button onClick={() => handleLike(msg._id)} className={`flex items-center gap-1 ${liked ? 'text-green-600' : 'text-gray-500'} hover:underline`}>
                      <ThumbsUp className="h-4 w-4" /> {msg.likedBy ? msg.likedBy.length : 0}
                    </button>
                    <button onClick={() => handleUnlike(msg._id)} className={`flex items-center gap-1 ${unliked ? 'text-red-600' : 'text-gray-500'} hover:underline`}>
                      <ThumbsDown className="h-4 w-4" /> {msg.unlikedBy ? msg.unlikedBy.length : 0}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder={replyTo ? "Reply to message..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={sending}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold"
          onClick={handleSend}
          disabled={sending}
        >
          {replyTo ? "Reply" : "Send"}
        </button>
      </div>
      {replyTo && (
        <div className="mt-2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded">Replying to: <span className="italic">{replyTo.text}</span> <button className="ml-2 text-red-500 underline" onClick={() => setReplyTo(null)}>Cancel</button></div>
      )}
    </div>
  );
} 