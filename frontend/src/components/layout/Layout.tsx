import React from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  useWebSocket(); // Initialize WebSocket connection

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  className="h-8 w-auto"
                  src="/logo.png"
                  alt="EcoRwanda"
                />
              </div>
            </div>
            <div className="flex items-center">
              {session && <NotificationDropdown />}
              {/* Add other header items here */}
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 