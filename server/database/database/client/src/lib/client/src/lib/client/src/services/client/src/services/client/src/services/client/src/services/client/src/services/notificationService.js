// =====================================
// VIP MEDIA HUB
// NOTIFICATION SERVICE
// =====================================

import { API_BASE_URL } from "../lib/api";

// =====================================
// REQUEST HEADERS
// =====================================

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-telegram-init-data":
      window.Telegram?.WebApp?.initData || ""
  };
}

// =====================================
// API REQUEST
// =====================================

async function notificationRequest(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Notification request failed"
    );
  }

  return result;
}

// =====================================
// GET NOTIFICATIONS
// =====================================

export async function getNotifications() {
  const result = await notificationRequest(
    "/api/notifications"
  );

  return result.notifications || [];
}

// =====================================
// UNREAD NOTIFICATIONS
// =====================================

export async function getUnreadNotifications() {
  const notifications = await getNotifications();

  return notifications.filter(
    notification => !notification.is_read
  );
}

// =====================================
// UNREAD COUNT
// =====================================

export async function getUnreadCount() {
  const notifications = await getUnreadNotifications();

  return notifications.length;
}

// =====================================
// MARK AS READ
// =====================================

export async function markNotificationAsRead(id) {
  if (!id) {
    throw new Error("Notification ID is required");
  }

  return notificationRequest(
    `/api/notifications/${encodeURIComponent(id)}/read`,
    {
      method: "PATCH"
    }
  );
}

// =====================================
// MARK ALL AS READ
// =====================================

export async function markAllNotificationsAsRead() {
  return notificationRequest(
    "/api/notifications/read-all",
    {
      method: "POST"
    }
  );
}

// =====================================
// DELETE NOTIFICATION
// =====================================

export async function deleteNotification(id) {
  if (!id) {
    throw new Error("Notification ID is required");
  }

  return notificationRequest(
    `/api/notifications/${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );
}
