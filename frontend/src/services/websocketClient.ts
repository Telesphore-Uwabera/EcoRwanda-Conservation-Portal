class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private maxReconnectTimeout = 30000; // Max 30 seconds
  private token: string;
  private onMessageCallback: ((data: any) => void) | null = null;

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectTimeout = 1000;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.reconnectTimeout = Math.min(
        this.reconnectTimeout * 2,
        this.maxReconnectTimeout
      );

      console.log(`Attempting to reconnect in ${this.reconnectTimeout}ms...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  setOnMessageCallback(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

// Create a singleton instance
let instance: WebSocketClient | null = null;

export const initWebSocket = (token: string) => {
  if (!instance) {
    instance = new WebSocketClient(token);
    instance.connect();
  }
  return instance;
};

export const getWebSocket = () => {
  if (!instance) {
    throw new Error('WebSocket not initialized');
  }
  return instance;
};

export const disconnectWebSocket = () => {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}; 