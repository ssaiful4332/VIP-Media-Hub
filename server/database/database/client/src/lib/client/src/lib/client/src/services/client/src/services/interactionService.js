// =====================================
// VIP MEDIA HUB
// USER INTERACTION SERVICE
// =====================================

import { API_BASE_URL } from "../lib/api";

function getHeaders() {
  const initData =
    window.Telegram?.WebApp?.initData || "";

  return {
    "Content-Type": "application/json",
    "x-telegram-init-data": initData
  };
}

async function request(endpoint, options = {}) {
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
      result.message || "Request failed"
    );
  }

  return result;
}

// =====================================
// LIKE VIDEO
// =====================================

export async function likeVideo(videoId) {
  return request("/api/interactions/like", {
    method: "POST",
    body: JSON.stringify({ videoId })
  });
}

// =====================================
// REMOVE LIKE
// =====================================

export async function unlikeVideo(videoId) {
  return request("/api/interactions/like", {
    method: "DELETE",
    body: JSON.stringify({ videoId })
  });
}

// =====================================
// ADD FAVORITE
// =====================================

export async function addFavorite(videoId) {
  return request("/api/interactions/favorite", {
    method: "POST",
    body: JSON.stringify({ videoId })
  });
}

// =====================================
// REMOVE FAVORITE
// =====================================

export async function removeFavorite(videoId) {
  return request("/api/interactions/favorite", {
    method: "DELETE",
    body: JSON.stringify({ videoId })
  });
}

// =====================================
// SAVE WATCH HISTORY
// =====================================

export async function saveWatchHistory(
  videoId,
  progressSeconds,
  completed = false
) {
  return request("/api/interactions/history", {
    method: "POST",
    body: JSON.stringify({
      videoId,
      progressSeconds,
      completed
    })
  });
}

// =====================================
// ADD RATING
// =====================================

export async function rateVideo(videoId, rating) {
  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error("Rating must be between 1 and 5");
  }

  return request("/api/interactions/rating", {
    method: "POST",
    body: JSON.stringify({
      videoId,
      rating
    })
  });
}

// =====================================
// ADD COMMENT
// =====================================

export async function addComment(videoId, comment) {
  const text = String(comment || "").trim();

  if (!text) {
    throw new Error("Comment cannot be empty");
  }

  if (text.length > 1000) {
    throw new Error("Comment is too long");
  }

  return request("/api/interactions/comment", {
    method: "POST",
    body: JSON.stringify({
      videoId,
      comment: text
    })
  });
}

// =====================================
// GET USER FAVORITES
// =====================================

export async function getMyFavorites() {
  return request("/api/interactions/favorites");
}

// =====================================
// GET USER WATCH HISTORY
// =====================================

export async function getMyWatchHistory() {
  return request("/api/interactions/history");
}
