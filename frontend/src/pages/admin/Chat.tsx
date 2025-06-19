import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, CornerDownRight } from "lucide-react";
import api from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  _id: string;
  user: { firstName: string; lastName: string; role: string };
  text: string;
  likes: number;
  unlikes: number;
  replies: ChatMessage[];
  createdAt: string;
  replyTo?: ChatMessage;
  likedBy?: string[];
  unlikedBy?: string[];
}

export default function AdminChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [likedMessages, setLikedMessages] = useState<{ [id: string]: 'like' | 'unlike' | undefined }>({});

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

  const handleLike = async (id: string) => {
    await api.post(`/chat/${id}/like`);
    fetchMessages();
  };

  const handleUnlike = async (id: string) => {
    await api.post(`/chat/${id}/unlike`);
    fetchMessages();
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo(msg);
  };

  const getRoleColor = (role: string) => {
    if (role === "administrator") return "bg-blue-50 border-blue-400 text-blue-900";
    if (role === "ranger") return "bg-green-50 border-green-400 text-green-900";
    return "bg-gray-50 border-gray-300 text-gray-800";
  };

  return (
    <div className="p-8 flex flex-col items-center min-h-[60vh]">
      <MessageSquare className="h-16 w-16 text-blue-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-center">Admin Chat</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mb-6 min-h-[300px] max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(messages) && messages.map((msg) => {
              const liked = msg.likedBy && user && msg.likedBy.some((u: any) => u === user._id || u._id === user._id);
              const unliked = msg.unlikedBy && user && msg.unlikedBy.some((u: any) => u === user._id || u._id === user._id);
              return (
                <div key={msg._id} className={`rounded-lg border px-4 py-2 ${getRoleColor(msg.user?.role)}`}> 
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{msg.user?.firstName} {msg.user?.lastName}</span>
                    <span className="text-xs text-gray-400 ml-2">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <div className="text-gray-800 mb-1">{msg.text}</div>
                  {Array.isArray(msg.replies) && msg.replies.length > 0 && msg.replies.map(reply => {
                    const replyLiked = reply.likedBy && user && reply.likedBy.some((u: any) => u === user._id || u._id === user._id);
                    const replyUnliked = reply.unlikedBy && user && reply.unlikedBy.some((u: any) => u === user._id || u._id === user._id);
                    return (
                      <div key={reply._id} className="ml-6 mt-2 p-2 rounded border bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{reply.user?.firstName} {reply.user?.lastName}</span>
                          <span className="text-xs text-gray-400 ml-2">{reply.createdAt ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <div className="text-xs italic text-gray-500 border-l-2 border-gray-300 pl-2 mb-1">Replying to: {msg.text}</div>
                        <div className="text-gray-800 mb-1">{reply.text}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <button onClick={() => handleLike(reply._id)} className={`flex items-center gap-1 ${replyLiked ? 'text-blue-600' : 'text-gray-500'} hover:underline`}>
                            <ThumbsUp className="h-4 w-4" /> {reply.likedBy ? reply.likedBy.length : 0}
                          </button>
                          <button onClick={() => handleUnlike(reply._id)} className={`flex items-center gap-1 ${replyUnliked ? 'text-red-600' : 'text-gray-500'} hover:underline`}>
                            <ThumbsDown className="h-4 w-4" /> {reply.unlikedBy ? reply.unlikedBy.length : 0}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <button onClick={() => handleReply(msg)} className="flex items-center gap-1 text-gray-500 hover:underline">
                      <CornerDownRight className="h-4 w-4" /> Reply
                    </button>
                    <button onClick={() => handleLike(msg._id)} className={`flex items-center gap-1 ${liked ? 'text-blue-600' : 'text-gray-500'} hover:underline`}>
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
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          onClick={handleSend}
          disabled={sending}
        >
          {replyTo ? "Reply" : "Send"}
        </button>
      </div>
      {replyTo && (
        <div className="mt-2 text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">Replying to: <span className="italic">{replyTo.text}</span> <button className="ml-2 text-red-500 underline" onClick={() => setReplyTo(null)}>Cancel</button></div>
      )}
    </div>
  );
} 