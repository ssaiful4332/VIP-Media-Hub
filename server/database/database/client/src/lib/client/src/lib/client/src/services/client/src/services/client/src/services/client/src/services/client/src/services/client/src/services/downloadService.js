// =====================================
// VIP MEDIA HUB
// DOWNLOAD MANAGER SERVICE
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

async function downloadRequest(endpoint, options = {}) {
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
      result.message || "Download request failed"
    );
  }

  return result;
}

// =====================================
// GET DOWNLOAD HISTORY
// =====================================

export async function getDownloadHistory() {
  const result = await downloadRequest(
    "/api/downloads"
  );

  return result.downloads || [];
}

// =====================================
// CREATE DOWNLOAD RECORD
// =====================================

export async function createDownload(videoId) {
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  return downloadRequest("/api/downloads", {
    method: "POST",
    body: JSON.stringify({ videoId })
  });
}

// =====================================
// GET DOWNLOAD LINK
// =====================================

export async function getDownloadLink(videoId) {
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  return downloadRequest(
    `/api/downloads/${encodeURIComponent(videoId)}/link`
  );
}

// =====================================
// DELETE DOWNLOAD HISTORY
// =====================================

export async function removeDownloadRecord(id) {
  if (!id) {
    throw new Error("Download ID is required");
  }

  return downloadRequest(
    `/api/downloads/${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );
}

// =====================================
// CLEAR DOWNLOAD HISTORY
// =====================================

export async function clearDownloadHistory() {
  return downloadRequest("/api/downloads", {
    method: "DELETE"
  });
}

// =====================================
// BROWSER DOWNLOAD
// =====================================

export function startBrowserDownload(url, filename) {
  if (!url) {
    throw new Error("Download URL is missing");
  }

  const link = document.createElement("a");

  link.href = url;
  link.download = filename || "vip-media-video";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  link.remove();
}
