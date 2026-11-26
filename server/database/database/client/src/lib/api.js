// =====================================
// VIP MEDIA HUB - API CONNECTION
// =====================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

// =====================================
// TELEGRAM WEB APP DATA
// =====================================

function getTelegramInitData() {
  return window.Telegram?.WebApp?.initData || "";
}

// =====================================
// API REQUEST FUNCTION
// =====================================

async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  const initData = getTelegramInitData();

  if (initData) {
    headers["x-telegram-init-data"] = initData;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      "Server-এর সঙ্গে সংযোগ করা যাচ্ছে না।"
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Server থেকে সঠিক উত্তর পাওয়া যায়নি।");
  }

  if (!response.ok) {
    throw new Error(
      result.message || "একটি সমস্যা হয়েছে।"
    );
  }

  return result;
}

// =====================================
// GET ALL VIDEOS
// =====================================

export async function getVideos() {
  const result = await request("/api/videos");

  return result.videos || [];
}

// =====================================
// SEARCH VIDEOS
// =====================================

export async function searchVideos(query) {
  const searchQuery = encodeURIComponent(
    String(query || "").trim()
  );

  if (!searchQuery) return [];

  const result = await request(
    `/api/videos/search?q=${searchQuery}`
  );

  return result.videos || [];
}

// =====================================
// TELEGRAM USER LOGIN
// =====================================

export async function telegramLogin() {
  const initData = getTelegramInitData();

  if (!initData) {
    throw new Error(
      "Telegram Mini App থেকে অ্যাপটি চালু করুন।"
    );
  }

  return request("/api/auth/telegram", {
    method: "POST"
  });
}

// =====================================
// ADMIN: ADD VIDEO
// =====================================

export async function addVideo(video) {
  return request("/api/admin/videos", {
    method: "POST",
    body: JSON.stringify(video)
  });
}

// =====================================
// SERVER HEALTH CHECK
// =====================================

export async function checkServer() {
  return request("/health");
}

// =====================================
// API BASE URL
// =====================================

export const API_BASE_URL = API_URL;
