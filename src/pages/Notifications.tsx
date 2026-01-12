import { useEffect, useState } from "react";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

type FilterType = "all" | "unread";

export default function Notifications() {
  const [filter, setFilter] = useState<FilterType>("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications(1, filter === "unread");
  }, [filter, fetchNotifications]);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const handleNotificationClick = async (notificationId: string, link?: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification && !notification.isRead) {
      await markAsRead(notificationId);
    }

    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificacoes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas notificacoes do sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {filter === "all" ? "Todas" : "Nao lidas"}
                {filter === "unread" && unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={filter === "all"}
                onCheckedChange={() => setFilter("all")}
              >
                Todas as notificacoes
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filter === "unread"}
                onCheckedChange={() => setFilter("unread")}
              >
                Apenas nao lidas
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {filter === "unread"
                ? "Nenhuma notificacao nao lida"
                : "Nenhuma notificacao"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {filter === "unread"
                ? "Voce esta em dia! Todas as notificacoes foram lidas."
                : "Quando houver notificacoes, elas aparecerao aqui."}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() =>
                    handleNotificationClick(notification.id, notification.link)
                  }
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="p-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {notifications.length}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Nao lidas</div>
          <div className={cn(
            "text-2xl font-bold mt-1",
            unreadCount > 0 ? "text-primary" : "text-foreground"
          )}>
            {unreadCount}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Lidas</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {notifications.filter((n) => n.isRead).length}
          </div>
        </div>
      </div>
    </div>
  );
}
