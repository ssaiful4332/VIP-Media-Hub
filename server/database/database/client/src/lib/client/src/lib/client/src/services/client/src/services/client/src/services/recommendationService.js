// =====================================
// VIP MEDIA HUB
// SMART RECOMMENDATION SERVICE
// =====================================

import { loadVideos } from "./videoService";

// =====================================
// HELPER
// =====================================

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

// =====================================
// POPULAR VIDEOS
// =====================================

export async function getPopularRecommendations() {
  const videos = await loadVideos();

  return [...videos]
    .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
    .slice(0, 20);
}

// =====================================
// CATEGORY RECOMMENDATIONS
// =====================================

export async function getCategoryRecommendations(category) {
  const videos = await loadVideos();
  const selectedCategory = normalize(category);

  return videos.filter(
    video => normalize(video.category) === selectedCategory
  );
}

// =====================================
// RELATED VIDEOS
// =====================================

export async function getRelatedVideos(videoId) {
  const videos = await loadVideos();

  const currentVideo = videos.find(
    video => String(video.id) === String(videoId)
  );

  if (!currentVideo) return [];

  return videos
    .filter(video => String(video.id) !== String(videoId))
    .map(video => {
      let score = 0;

      if (
        normalize(video.category) ===
        normalize(currentVideo.category)
      ) {
        score += 5;
      }

      if (
        normalize(video.country) ===
        normalize(currentVideo.country)
      ) {
        score += 2;
      }

      if (
        normalize(video.language) ===
        normalize(currentVideo.language)
      ) {
        score += 2;
      }

      const currentGenres = currentVideo.genre || [];
      const videoGenres = video.genre || [];

      const sharedGenres = currentGenres.filter(
        genre =>
          videoGenres.some(
            item => normalize(item) === normalize(genre)
          )
      );

      score += sharedGenres.length * 3;

      return { ...video, recommendationScore: score };
    })
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore
    )
    .slice(0, 20);
}

// =====================================
// PERSONALIZED RECOMMENDATIONS
// =====================================

export async function getPersonalizedRecommendations(
  preferredCategories = [],
  watchedVideoIds = []
) {
  const videos = await loadVideos();

  const preferences = preferredCategories.map(normalize);

  return videos
    .filter(
      video =>
        !watchedVideoIds.some(
          id => String(id) === String(video.id)
        )
    )
    .map(video => {
      let score = Number(video.views || 0) / 1000;

      if (preferences.includes(normalize(video.category))) {
        score += 10;
      }

      if (video.featured) {
        score += 3;
      }

      return {
        ...video,
        recommendationScore: score
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore
    )
    .slice(0, 20);
}

// =====================================
// TRENDING RECOMMENDATIONS
// =====================================

export async function getTrendingRecommendations() {
  const videos = await loadVideos();

  return [...videos]
    .sort((a, b) => {
      const viewsA = Number(a.views || 0);
      const viewsB = Number(b.views || 0);

      return viewsB - viewsA;
    })
    .slice(0, 20);
}
