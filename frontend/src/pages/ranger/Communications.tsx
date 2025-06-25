import React from "react";
import { MessageSquare, Megaphone, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Communications() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Ranger Communications Hub</h1>
      <p className="text-gray-700 text-lg mb-8 text-center">
        Connect, collaborate, and stay informed! Use the tools below to communicate with your team and admins.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Chat Section */}
        <Link to="/ranger/chat" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-blue-100 hover:shadow-lg transition">
          <MessageSquare className="h-12 w-12 text-blue-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <p className="text-gray-600 text-center mb-2">Real-time messaging with fellow rangers and admins. Share updates, ask questions, and stay connected instantly.</p>
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mt-2">Chat with Us</span>
        </Link>
        {/* Announcements Section */}
        <Link to="/ranger/announcements" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-yellow-100 hover:shadow-lg transition">
          <Megaphone className="h-12 w-12 text-yellow-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Announcements</h2>
          <p className="text-gray-600 text-center mb-2">Stay up-to-date with important announcements from admins and your team. Never miss a critical update or event.</p>
          <span className="inline-block bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium mt-2">View Now</span>
        </Link>
        {/* Team Collaboration Section */}
        <Link to="/ranger/collaboration" className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-green-100 hover:shadow-lg transition">
          <Users className="h-12 w-12 text-green-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Team Collaboration</h2>
          <p className="text-gray-600 text-center mb-2">Work together on projects, share files, and coordinate patrols with rangers and admins in dedicated collaboration spaces.</p>
          <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium mt-2">Collaborate with Us</span>
        </Link>
      </div>
      <div className="mt-10 text-center text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
        🚀 Communicate with us for our wildlife conservation! Have ideas or needs? Let your admin know what would help your team communicate and collaborate best.
      </div>
    </div>
  );
} 