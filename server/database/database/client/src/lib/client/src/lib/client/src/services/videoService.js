// =====================================
// VIP MEDIA HUB
// VIDEO SERVICE
// =====================================

import {
  getVideos,
  searchVideos
} from "../lib/api";

// =====================================
// LOAD VIDEOS
// =====================================

export async function loadVideos() {
  try {
    const videos = await getVideos();

    return videos.map(video => ({
      ...video,
      title: video.title || "Untitled Video",
      description: video.description || "",
      category: video.category || "Uncategorized",
      thumbnail:
        video.thumbnail_url ||
        "/images/video-placeholder.png",
      videoUrl: video.video_url || "",
      year: video.release_year || "",
      views: Number(video.views || 0)
    }));
  } catch (error) {
    console.error("Load videos error:", error);
    throw error;
  }
}

// =====================================
// SEARCH VIDEOS
// =====================================

export async function findVideos(query) {
  const keyword = String(query || "").trim();

  if (!keyword) {
    return [];
  }

  try {
    const videos = await searchVideos(keyword);

    return videos.map(video => ({
      ...video,
      thumbnail:
        video.thumbnail_url ||
        "/images/video-placeholder.png",
      videoUrl: video.video_url || ""
    }));
  } catch (error) {
    console.error("Video search error:", error);
    throw error;
  }
}

// =====================================
// GET VIDEO DETAILS
// =====================================

export async function getVideoDetails(videoId) {
  if (!videoId) {
    throw new Error("Video ID is required");
  }

  const videos = await loadVideos();

  const video = videos.find(
    item => String(item.id) === String(videoId)
  );

  if (!video) {
    throw new Error("Video not found");
  }

  return video;
}

// =====================================
// FILTER VIDEOS BY CATEGORY
// =====================================

export async function getVideosByCategory(category) {
  const videos = await loadVideos();

  return videos.filter(
    video =>
      String(video.category).toLowerCase() ===
      String(category).toLowerCase()
  );
}

// =====================================
// FILTER FEATURED VIDEOS
// =====================================

export async function getFeaturedVideos() {
  const videos = await loadVideos();

  return videos.filter(video => video.featured === true);
}

// =====================================
// SORT TRENDING VIDEOS
// =====================================

export async function getTrendingVideos() {
  const videos = await loadVideos();

  return [...videos].sort(
    (a, b) => b.views - a.views
  );
}

// =====================================
// SORT LATEST VIDEOS
// =====================================

export async function getLatestVideos() {
  const videos = await loadVideos();

  return [...videos].sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );
}
