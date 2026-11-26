// =====================================
// VIP MEDIA HUB
// USER PROFILE SERVICE
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

async function profileRequest(endpoint, options = {}) {
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
      result.message || "Profile request failed"
    );
  }

  return result;
}

// =====================================
// GET MY PROFILE
// =====================================

export async function getMyProfile() {
  const result = await profileRequest("/api/profile");

  return result.user || null;
}

// =====================================
// UPDATE PROFILE
// =====================================

export async function updateMyProfile(profileData) {
  if (!profileData || typeof profileData !== "object") {
    throw new Error("Invalid profile information");
  }

  return profileRequest("/api/profile", {
    method: "PATCH",
    body: JSON.stringify({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      username: profileData.username
    })
  });
}

// =====================================
// GET ACCOUNT SETTINGS
// =====================================

export async function getAccountSettings() {
  const result = await profileRequest(
    "/api/profile/settings"
  );

  return result.settings || {};
}

// =====================================
// UPDATE ACCOUNT SETTINGS
// =====================================

export async function updateAccountSettings(settings) {
  return profileRequest("/api/profile/settings", {
    method: "PATCH",
    body: JSON.stringify(settings)
  });
}

// =====================================
// GET ACCOUNT ACTIVITY
// =====================================

export async function getAccountActivity() {
  const result = await profileRequest(
    "/api/profile/activity"
  );

  return result.activity || [];
}
