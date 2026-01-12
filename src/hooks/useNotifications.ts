import { useEffect, useCallback, useRef } from "react";
import { create } from "zustand";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import {
  notificationService,
  NotificationWebSocket
} from "@/services/notificationService";
import type { Notification, NotificationBroadcastRequest } from "@/types/notification";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  setPagination: (page: number, totalPages: number) => void;
  markNotificationAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isConnected: false,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
  setNotifications: (notifications) =>
    set({ notifications, hasMore: notifications.length > 0 }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  resetUnreadCount: () => set({ unreadCount: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
  setConnected: (isConnected) => set({ isConnected }),
  setPagination: (currentPage, totalPages) =>
    set({ currentPage, totalPages, hasMore: currentPage < totalPages }),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ),
    })),
}));

export function useNotifications() {
  const wsRef = useRef<NotificationWebSocket | null>(null);
  const { token, isAuthenticated } = useAuthStore();

  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    currentPage,
    hasMore,
    setNotifications,
    addNotification,
    setUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
    setLoading,
    setConnected,
    setPagination,
    markNotificationAsRead,
  } = useNotificationStore();

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, unreadOnly = false) => {
      setLoading(true);
      try {
        const response = await notificationService.getNotifications({
          page,
          limit: 20,
          unreadOnly,
        });

        if (page === 1) {
          setNotifications(response.data);
        } else {
          setNotifications([...notifications, ...response.data]);
        }

        if (response.pagination) {
          setPagination(response.pagination.page, response.pagination.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Falha ao carregar notificacoes");
      } finally {
        setLoading(false);
      }
    },
    [notifications, setNotifications, setLoading, setPagination]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [setUnreadCount]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        markNotificationAsRead(notificationId);
        decrementUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        toast.error("Falha ao marcar notificacao como lida");
      }
    },
    [markNotificationAsRead, decrementUnreadCount]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      resetUnreadCount();
      toast.success("Todas as notificacoes foram marcadas como lidas");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Falha ao marcar notificacoes como lidas");
    }
  }, [notifications, setNotifications, resetUnreadCount]);

  // Broadcast notification (superadmin only)
  const broadcast = useCallback(
    async (request: NotificationBroadcastRequest) => {
      try {
        const result = await notificationService.broadcast(request);
        toast.success(`Notificacao enviada para ${result.count} usuario(s)`);
        return result;
      } catch (error) {
        console.error("Failed to broadcast notification:", error);
        toast.error("Falha ao enviar notificacao");
        throw error;
      }
    },
    []
  );

  // Load more notifications
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchNotifications(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, fetchNotifications]);

  // Handle incoming WebSocket notification
  const handleIncomingNotification = useCallback(
    (notification: Notification) => {
      addNotification(notification);

      // Show toast for new notification
      toast(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    },
    [addNotification]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
      return;
    }

    // Create WebSocket connection
    wsRef.current = new NotificationWebSocket(() => token);

    wsRef.current.onNotification(handleIncomingNotification);
    wsRef.current.onConnectionStateChange(setConnected);

    wsRef.current.connect();

    // Fetch initial data
    fetchUnreadCount();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [isAuthenticated, token, handleIncomingNotification, setConnected, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    broadcast,
    loadMore,
  };
}
