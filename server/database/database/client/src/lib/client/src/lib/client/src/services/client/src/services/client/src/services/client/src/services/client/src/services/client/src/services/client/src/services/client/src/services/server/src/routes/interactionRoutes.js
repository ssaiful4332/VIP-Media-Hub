// =====================================
// VIP MEDIA HUB
// INTERACTION ROUTES
// =====================================

import express from "express";

export default function interactionRoutes(
  supabase,
  requireTelegram
) {
  const router = express.Router();

  // ===================================
  // FIND AUTHENTICATED USER
  // ===================================

  async function getUser(req) {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq(
        "telegram_id",
        String(req.telegramUser.id)
      )
      .single();

    if (error || !data) {
      throw new Error("User profile not found");
    }

    return data;
  }

  // ===================================
  // LIKE VIDEO
  // ===================================

  router.post("/like", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);
      const { videoId } = req.body;

      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: "Video ID required"
        });
      }

      const { error } = await supabase
        .from("likes")
        .upsert({
          user_id: user.id,
          video_id: videoId
        }, {
          onConflict: "user_id,video_id"
        });

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // REMOVE LIKE
  // ===================================

  router.delete("/like", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", req.body.videoId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // ADD FAVORITE
  // ===================================

  router.post("/favorite", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { error } = await supabase
        .from("favorites")
        .upsert({
          user_id: user.id,
          video_id: req.body.videoId
        }, {
          onConflict: "user_id,video_id"
        });

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // REMOVE FAVORITE
  // ===================================

  router.delete("/favorite", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("video_id", req.body.videoId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // WATCH HISTORY
  // ===================================

  router.post("/history", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { videoId, progressSeconds, completed } =
        req.body;

      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: "Video ID required"
        });
      }

      const { error } = await supabase
        .from("watch_history")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress_seconds: Math.max(
            0,
            Number(progressSeconds) || 0
          ),
          completed: Boolean(completed),
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id,video_id"
        });

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // ADD RATING
  // ===================================

  router.post("/rating", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);
      const { videoId, rating } = req.body;

      if (
        !videoId ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid video ID or rating"
        });
      }

      const { error } = await supabase
        .from("ratings")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          rating
        }, {
          onConflict: "user_id,video_id"
        });

      if (error) throw error;

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // ADD COMMENT
  // ===================================

  router.post("/comment", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { videoId, comment } = req.body;
      const text = String(comment || "").trim();

      if (!videoId || !text || text.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Invalid comment"
        });
      }

      const { error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          video_id: videoId,
          comment: text,
          approved: false
        });

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: "Comment submitted for review"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // GET MY FAVORITES
  // ===================================

  router.get("/favorites", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { data, error } = await supabase
        .from("favorites")
        .select("*, videos(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      res.json({
        success: true,
        favorites: data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  // ===================================
  // GET MY WATCH HISTORY
  // ===================================

  router.get("/history", requireTelegram, async (req, res) => {
    try {
      const user = await getUser(req);

      const { data, error } = await supabase
        .from("watch_history")
        .select("*, videos(*)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        history: data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

  return router;
    }
