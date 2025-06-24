import React from "react";
import { MessageSquare, Megaphone, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminCommunications() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Communications Hub</h1>
      <p className="text-gray-700 text-lg mb-8 text-center">
        Manage communications for your team and rangers. Use the tools below to post announcements, chat, and collaborate.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chat Section */}
        <Link to="/admin/chat" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-blue-100 hover:shadow-lg transition">
          <MessageSquare className="h-12 w-12 text-blue-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <p className="text-gray-600 text-center mb-2">Real-time messaging with rangers and admins. Share updates, ask questions, and stay connected instantly.</p>
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mt-2">Chat with Us</span>
        </Link>
        {/* Announcements Section */}
        <Link to="/admin/announcements" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-yellow-100 hover:shadow-lg transition">
          <Megaphone className="h-12 w-12 text-yellow-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Announcements</h2>
          <p className="text-gray-600 text-center mb-2">Post and manage important announcements for your team and rangers. Keep everyone informed.</p>
          <span className="inline-block bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium mt-2">Manage</span>
        </Link>
        {/* Team Collaboration Section */}
        <Link to="/admin/collaboration" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-green-100 hover:shadow-lg transition">
          <Users className="h-12 w-12 text-green-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Team Collaboration</h2>
          <p className="text-gray-600 text-center mb-2">Work together on projects, share files, and coordinate with rangers and admins in dedicated collaboration spaces.</p>
          <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium mt-2">Collaborate with Us</span>
        </Link>
      </div>
      <div className="mt-10 text-center text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
        🚀 We're building these features for you! Have ideas or needs? Let your team know what would help your organization communicate and collaborate best.
      </div>
    </div>
  );
} 