import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, CornerDownRight } from "lucide-react";
import api from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  _id: string;
  user: { firstName: string; lastName: string };
  text: string;
  likes: number;
  unlikes: number;
  replies: ChatMessage[];
}

export default function AdminChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

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
        await api.post(`/chat/${replyTo}/reply`, { text: input });
      } else {
        await api.post("/chat", { text: input });
      }
      setInput("");
      setReplyTo(null);
      fetchMessages();
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await api.post(`/chat/${id}/like`);
      fetchMessages();
    } catch {}
  };

  const handleUnlike = async (id: string) => {
    try {
      await api.post(`/chat/${id}/unlike`);
      fetchMessages();
    } catch {}
  };

  const handleReply = (id: string) => {
    setReplyTo(id);
  };

  const renderMessages = (msgs: ChatMessage[], isReply = false) =>
    msgs.map((msg) => (
      <div key={msg._id} className={`mb-4 ${isReply ? "ml-8 border-l-2 pl-4 border-blue-100" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-blue-700">{msg.user?.firstName} {msg.user?.lastName}</span>
        </div>
        <div className="text-gray-800 mb-2">{msg.text}</div>
        <div className="flex items-center gap-4 text-sm">
          <button onClick={() => handleLike(msg._id)} className="flex items-center gap-1 text-blue-600 hover:underline">
            <ThumbsUp className="h-4 w-4" /> {msg.likes}
          </button>
          <button onClick={() => handleUnlike(msg._id)} className="flex items-center gap-1 text-red-500 hover:underline">
            <ThumbsDown className="h-4 w-4" /> {msg.unlikes}
          </button>
          <button onClick={() => handleReply(msg._id)} className="flex items-center gap-1 text-gray-500 hover:underline">
            <CornerDownRight className="h-4 w-4" /> Reply
          </button>
        </div>
        {msg.replies && msg.replies.length > 0 && renderMessages(msg.replies, true)}
      </div>
    ));

  return (
    <div className="p-8 flex flex-col items-center min-h-[60vh]">
      <MessageSquare className="h-16 w-16 text-blue-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-center">Admin Chat</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mb-6 min-h-[300px]">
        {loading ? (
          <div className="text-gray-400 text-center">Loading messages...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
        ) : (
          renderMessages(messages)
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
        <div className="mt-2 text-sm text-blue-700">Replying to message <button className="ml-2 text-red-500 underline" onClick={() => setReplyTo(null)}>Cancel</button></div>
      )}
    </div>
  );
} 