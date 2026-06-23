import { create } from 'zustand';
import { getNotifications, markAllRead, checkOverdue } from '@/app/actions/notificationActions';

interface NotificationItem {
  _id: string;
  message: string;
  type: 'info' | 'overdue' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface PlannerState {
  notifications: NotificationItem[];
  unreadCount: number;
  loadingNotifications: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  scanOverdueMissions: () => Promise<void>;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loadingNotifications: false,

  fetchNotifications: async () => {
    set({ loadingNotifications: true });
    try {
      const list = await getNotifications();
      const unread = list.filter((n: any) => !n.isRead).length;
      set({ notifications: list, unreadCount: unread });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      set({ loadingNotifications: false });
    }
  },

  markNotificationsRead: async () => {
    try {
      await markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  },

  scanOverdueMissions: async () => {
    try {
      const res = await checkOverdue();
      if (res && res.scannedCount > 0) {
        // Refresh notifications list to get new items
        await get().fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to scan overdue missions:', err);
    }
  }
}));
