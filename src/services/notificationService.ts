import api from "./api";
import type {
  Notification,
  NotificationBroadcastRequest,
  WebSocketMessage
} from "@/types/notification";

interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

export const notificationService = {
  /**
   * Get paginated notifications for superadmin
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsResponse> {
    const { data } = await api.get<NotificationsResponse>(
      "/superadmin/notifications",
      { params }
    );
    return data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<UnreadCountResponse>(
      "/superadmin/notifications/unread-count"
    );
    return data.data.count;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/superadmin/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await api.put("/superadmin/notifications/read-all");
  },

  /**
   * Broadcast notification to users (superadmin only)
   */
  async broadcast(request: NotificationBroadcastRequest): Promise<{ count: number }> {
    const { data } = await api.post<{ success: boolean; data: { count: number } }>(
      "/superadmin/notifications/broadcast",
      request
    );
    return data.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/superadmin/notifications/${notificationId}`);
  },
};

/**
 * WebSocket connection manager for real-time notifications
 */
export class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private onMessageCallback: ((notification: Notification) => void) | null = null;
  private onConnectionChange: ((connected: boolean) => void) | null = null;

  constructor(
    private getToken: () => string | null
  ) {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    const token = this.getToken();
    if (!token) {
      console.warn("No auth token available for WebSocket connection");
      return;
    }

    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/ws/notifications?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.onConnectionChange?.(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "notification" && message.data) {
            this.onMessageCallback?.(message.data);
          } else if (message.type === "pong") {
            // Server acknowledged our ping
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        this.cleanup();
        this.onConnectionChange?.(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.cleanup();
    if (this.ws) {
      this.ws.close(1000, "Client disconnecting");
      this.ws = null;
    }
  }

  /**
   * Set callback for incoming notifications
   */
  onNotification(callback: (notification: Notification) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Set callback for connection state changes
   */
  onConnectionStateChange(callback: (connected: boolean) => void): void {
    this.onConnectionChange = callback;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("Max WebSocket reconnection attempts reached");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`Attempting WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }
}
