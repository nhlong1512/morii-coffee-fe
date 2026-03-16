import { create } from "zustand";
import {
  notifications as initialNotifications,
  type Notification,
} from "@/data/notifications";

interface NotificationState {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: initialNotifications,

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },
}));
