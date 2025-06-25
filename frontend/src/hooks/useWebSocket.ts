import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { initWebSocket, disconnectWebSocket } from '@/services/websocketClient';
import { toast } from 'react-hot-toast';

export const useWebSocket = () => {
  const { data: session } = useSession();

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'notification') {
      // Show toast notification
      toast(data.data.message, {
        duration: 5000,
        position: 'top-right',
      });
    } else if (data.type === 'system') {
      // Handle system messages
      console.log('System message:', data.message);
    }
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      // Initialize WebSocket connection
      const ws = initWebSocket(session.accessToken);
      ws.setOnMessageCallback(handleWebSocketMessage);

      // Cleanup on unmount
      return () => {
        disconnectWebSocket();
      };
    }
  }, [session?.accessToken, handleWebSocketMessage]);

  return null;
}; 