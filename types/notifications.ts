export type NotificationType =
  | "expense_due_soon"
  | "expense_due_today"
  | "expense_overdue"
  | "follow_up_due_soon"
  | "follow_up_due_today"
  | "follow_up_overdue";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  actionUrl: string | null;
  dueDateSnapshot: string | null;
  isRead: boolean;
  readAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: "all" | "follow-ups" | "sales" | "bills" | "system";
  status?: "all" | "read" | "unread";
  dateRange?: "all" | "7" | "30" | "90";
  unreadOnly?: boolean;
  includeResolved?: boolean;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationResponse {
  notification: AppNotification;
}

export interface NotificationUnreadCountResponse {
  count: number;
}
