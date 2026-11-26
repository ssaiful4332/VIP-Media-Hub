// =====================================
// VIP MEDIA HUB
// ADMIN SERVICE
// =====================================

import { API_BASE_URL } from "../lib/api";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-telegram-init-data":
      window.Telegram?.WebApp?.initData || ""
  };
}

async function adminRequest(endpoint, options = {}) {
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
      result.message || "Admin request failed"
    );
  }

  return result;
}

// =====================================
// ADD VIDEO
// =====================================

export async function createVideo(videoData) {
  if (!videoData?.title || !videoData?.video_url) {
    throw new Error("Title and video URL are required");
  }

  return adminRequest("/api/admin/videos", {
    method: "POST",
    body: JSON.stringify(videoData)
  });
}

// =====================================
// UPDATE VIDEO
// =====================================

export async function updateVideo(videoId, videoData) {
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  return adminRequest(
    `/api/admin/videos/${encodeURIComponent(videoId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(videoData)
    }
  );
}

// =====================================
// PUBLISH VIDEO
// =====================================

export async function publishVideo(videoId) {
  return adminRequest(
    `/api/admin/videos/${encodeURIComponent(videoId)}/publish`,
    {
      method: "POST"
    }
  );
}

// =====================================
// ARCHIVE VIDEO
// =====================================

export async function archiveVideo(videoId) {
  return adminRequest(
    `/api/admin/videos/${encodeURIComponent(videoId)}/archive`,
    {
      method: "POST"
    }
  );
}

// =====================================
// DELETE VIDEO
// =====================================

export async function deleteVideo(videoId) {
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  return adminRequest(
    `/api/admin/videos/${encodeURIComponent(videoId)}`,
    {
      method: "DELETE"
    }
  );
}

// =====================================
// GET ADMIN DASHBOARD
// =====================================

export async function getAdminDashboard() {
  return adminRequest("/api/admin/dashboard");
}

// =====================================
// GET ADMIN ACTIVITY LOG
// =====================================

export async function getAdminActivity() {
  return adminRequest("/api/admin/activity");
}
