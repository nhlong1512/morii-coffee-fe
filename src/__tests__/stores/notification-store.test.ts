import { useNotificationStore } from "@/stores/notification-store";
import { notifications as initialNotifications } from "@/data/notifications";

beforeEach(() => {
  // Reset to initial seeded state before each test
  useNotificationStore.setState({
    notifications: initialNotifications.map((n) => ({ ...n })),
  });
});

describe("notification store — markAsRead", () => {
  it("sets isRead=true for the specified notification", () => {
    const unread = initialNotifications.find((n) => !n.isRead);
    if (!unread) throw new Error("Test requires at least one unread notification in seed data");

    useNotificationStore.getState().markAsRead(unread.id);
    const updated = useNotificationStore
      .getState()
      .notifications.find((n) => n.id === unread.id);
    expect(updated?.isRead).toBe(true);
  });

  it("does not change other notifications", () => {
    const notifications = useNotificationStore.getState().notifications;
    const target = notifications[0];
    const others = notifications.slice(1);
    const othersBefore = others.map((n) => n.isRead);

    useNotificationStore.getState().markAsRead(target.id);

    const othersAfter = useNotificationStore
      .getState()
      .notifications.slice(1)
      .map((n) => n.isRead);
    expect(othersAfter).toEqual(othersBefore);
  });

  it("is idempotent — marking already-read notification stays read", () => {
    const alreadyRead = initialNotifications.find((n) => n.isRead);
    if (!alreadyRead) throw new Error("Test requires at least one read notification in seed data");

    useNotificationStore.getState().markAsRead(alreadyRead.id);
    const updated = useNotificationStore
      .getState()
      .notifications.find((n) => n.id === alreadyRead.id);
    expect(updated?.isRead).toBe(true);
  });
});

describe("notification store — markAllAsRead", () => {
  it("sets isRead=true for all notifications", () => {
    useNotificationStore.getState().markAllAsRead();
    const all = useNotificationStore.getState().notifications;
    expect(all.every((n) => n.isRead)).toBe(true);
  });
});

describe("notification store — unreadCount", () => {
  it("returns the correct number of unread notifications", () => {
    const expectedUnread = initialNotifications.filter((n) => !n.isRead).length;
    expect(useNotificationStore.getState().unreadCount()).toBe(expectedUnread);
  });

  it("returns 0 after markAllAsRead", () => {
    useNotificationStore.getState().markAllAsRead();
    expect(useNotificationStore.getState().unreadCount()).toBe(0);
  });

  it("decrements by 1 after markAsRead on a single unread notification", () => {
    const unread = initialNotifications.find((n) => !n.isRead);
    if (!unread) return; // skip if all already read

    const before = useNotificationStore.getState().unreadCount();
    useNotificationStore.getState().markAsRead(unread.id);
    expect(useNotificationStore.getState().unreadCount()).toBe(before - 1);
  });
});
