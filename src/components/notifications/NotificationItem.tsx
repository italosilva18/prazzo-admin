import { forwardRef } from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Settings,
  CreditCard,
  Building2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  compact?: boolean;
}

const typeConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  error: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  system: {
    icon: Settings,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  billing: {
    icon: CreditCard,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  company: {
    icon: Building2,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  user: {
    icon: User,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Agora mesmo";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Ha ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Ha ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Ha ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, onClick, compact = false }, ref) => {
    const config = typeConfig[notification.type] || typeConfig.info;
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex gap-3 cursor-pointer transition-colors hover:bg-accent/50",
          compact ? "px-3 py-2" : "px-4 py-3",
          !notification.isRead && "bg-accent/30"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <div
          className={cn(
            "flex-shrink-0 rounded-full flex items-center justify-center",
            config.bg,
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
        >
          <Icon className={cn(config.color, compact ? "w-4 h-4" : "w-5 h-5")} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-foreground truncate",
                compact ? "text-xs" : "text-sm",
                !notification.isRead ? "font-semibold" : "font-medium"
              )}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p
            className={cn(
              "text-muted-foreground mt-0.5",
              compact ? "text-xs line-clamp-1" : "text-sm line-clamp-2"
            )}
          >
            {notification.message}
          </p>

          <span
            className={cn(
              "text-muted-foreground mt-1 block",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";
