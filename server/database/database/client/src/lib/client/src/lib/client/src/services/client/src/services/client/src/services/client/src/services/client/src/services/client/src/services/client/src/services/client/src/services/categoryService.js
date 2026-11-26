// =====================================
// VIP MEDIA HUB
// CATEGORY SERVICE
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

async function categoryRequest(endpoint) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: getHeaders()
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Category request failed"
    );
  }

  return result;
}

// =====================================
// GET ALL CATEGORIES
// =====================================

export async function getCategories() {
  const result = await categoryRequest(
    "/api/categories"
  );

  return result.categories || [];
}

// =====================================
// GET CATEGORY DETAILS
// =====================================

export async function getCategoryDetails(categoryId) {
  if (!categoryId) {
    throw new Error("Category ID is required");
  }

  const categories = await getCategories();

  return categories.find(
    category => String(category.id) === String(categoryId)
  ) || null;
}

// =====================================
// SEARCH CATEGORY
// =====================================

export async function searchCategories(query) {
  const keyword = String(query || "")
    .trim()
    .toLowerCase();

  const categories = await getCategories();

  if (!keyword) return categories;

  return categories.filter(category =>
    String(category.name || "")
      .toLowerCase()
      .includes(keyword)
  );
}

// =====================================
// GET VIDEOS BY CATEGORY
// =====================================

export async function getCategoryVideos(categoryName) {
  if (!categoryName) return [];

  const videosResponse = await fetch(
    `${API_BASE_URL}/api/videos`,
    {
      headers: getHeaders()
    }
  );

  const result = await videosResponse.json();

  if (!videosResponse.ok) {
    throw new Error("Could not load category videos");
  }

  const videos = result.videos || [];

  return videos.filter(
    video =>
      String(video.category || "").toLowerCase() ===
      String(categoryName).toLowerCase()
  );
}
