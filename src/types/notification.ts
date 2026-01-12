export type NotificationType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "system"
  | "billing"
  | "company"
  | "user";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  link?: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface NotificationBroadcastRequest {
  type: NotificationType;
  title: string;
  message: string;
  target: BroadcastTarget;
  targetValue?: string;
}

export type BroadcastTarget = "all" | "role" | "company";

export interface BroadcastTargetOption {
  value: BroadcastTarget;
  label: string;
  description: string;
}

export interface WebSocketMessage {
  type: "notification" | "ping" | "pong";
  data?: Notification;
}
