import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ===============================
// SUPABASE DATABASE CONNECTION
// ===============================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ===============================
// SECURITY
// ===============================

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",")
    : true
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

// ===============================
// TELEGRAM AUTHENTICATION
// ===============================

function validateTelegramData(initData) {
  if (!initData || !process.env.TELEGRAM_BOT_TOKEN) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));

  if (!receivedHash || !Number.isFinite(authDate)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (authDate > now + 60 || now - authDate > 86400) {
    return null;
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(calculatedHash, "hex");
  const b = Buffer.from(receivedHash, "hex");

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    return null;
  }

  try {
    const user = JSON.parse(params.get("user") || "null");

    if (!user?.id) return null;

    return user;
  } catch {
    return null;
  }
}

// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

function requireTelegram(req, res, next) {
  const user = validateTelegramData(
    req.headers["x-telegram-init-data"]
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Telegram authentication failed"
    });
  }

  req.telegramUser = user;
  next();
}
app.use("/api/interactions", interactionRoutes(supabase, requireTelegram));
// ===============================
// SUPER ADMIN MIDDLEWARE
// ===============================

function requireSuperAdmin(req, res, next) {
  const adminIds = (
    process.env.ADMIN_TELEGRAM_IDS || ""
  )
    .split(",")
    .map(id => id.trim())
    .filter(Boolean);

  if (!adminIds.includes(String(req.telegramUser.id))) {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required"
    });
  }

  next();
}

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "VIP Media Hub",
    message: "Backend server is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    database: Boolean(process.env.SUPABASE_URL)
  });
});

// ===============================
// GET ALL PUBLISHED VIDEOS
// ===============================

app.get("/api/videos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      videos: data
    });
  } catch (error) {
    console.error("Video fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not load videos"
    });
  }
});

// ===============================
// VIDEO SEARCH
// ===============================

app.get("/api/videos/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.json({
        success: true,
        videos: []
      });
    }

    const safeQuery = query
      .replace(/[,%()]/g, " ")
      .slice(0, 80);

    const { data, error } = await supabase
      .from("videos")
      .select("id,title,description,category,thumbnail_url,release_year")
      .eq("status", "published")
      .ilike("title", `%${safeQuery}%`)
      .limit(30);

    if (error) throw error;

    res.json({
      success: true,
      videos: data
    });
  } catch (error) {
    console.error("Search error:", error.message);

    res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
});

// ===============================
// TELEGRAM USER PROFILE
// ===============================

app.post(
  "/api/auth/telegram",
  requireTelegram,
  async (req, res) => {
    try {
      const user = req.telegramUser;

      const { data, error } = await supabase
        .from("users")
        .upsert({
          telegram_id: String(user.id),
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          username: user.username || null,
          photo_url: user.photo_url || null,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: "telegram_id"
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        user: data
      });
    } catch (error) {
      console.error("Login error:", error.message);

      res.status(500).json({
        success: false,
        message: "Login failed"
      });
    }
  }
);

// ===============================
// ADMIN: ADD VIDEO
// ===============================

app.post(
  "/api/admin/videos",
  requireTelegram,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        video_url,
        thumbnail_url,
        release_year
      } = req.body;

      if (!title || !video_url) {
        return res.status(400).json({
          success: false,
          message: "Title and video URL are required"
        });
      }

      const { data, error } = await supabase
        .from("videos")
        .insert({
          title,
          description,
          category,
          video_url,
          thumbnail_url,
          release_year,
          status: "published",
          uploaded_by_telegram_id:
            String(req.telegramUser.id)
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        video: data
      });
    } catch (error) {
      console.error("Admin upload error:", error.message);

      res.status(500).json({
        success: false,
        message: "Video could not be added"
      });
    }
  }
);

// ===============================
// TELEGRAM BOT WEBHOOK
// ===============================

app.post("/telegram/webhook", async (req, res) => {
  const secret = req.get(
    "x-telegram-bot-api-secret-token"
  );

  if (
    !process.env.TELEGRAM_WEBHOOK_SECRET ||
    secret !== process.env.TELEGRAM_WEBHOOK_SECRET
  ) {
    return res.sendStatus(401);
  }

  res.sendStatus(200);

  const message = req.body?.message;
  const chatId = message?.chat?.id;
  const text = message?.text || "";

  if (!chatId || !process.env.TELEGRAM_BOT_TOKEN) {
    return;
  }

  let reply = "VIP Media Hub-এ স্বাগতম!";

  if (text.startsWith("/start")) {
    reply = "স্বাগতম! VIP Media Hub Mini App চালু করুন।";
  } else if (text.startsWith("/movies")) {
    reply = "আমাদের ভিডিও ক্যাটালগ Mini App-এ দেখুন।";
  } else if (text.startsWith("/search")) {
    reply = "ভিডিও খুঁজতে Mini App-এর Search ব্যবহার করুন।";
  } else if (text.startsWith("/categories")) {
    reply = "Mini App-এ সব Video Categories দেখুন।";
  } else if (text.startsWith("/profile")) {
    reply = "আপনার Profile Mini App-এ পাওয়া যাবে।";
  } else if (text.startsWith("/downloads")) {
    reply = "আপনার Downloads Mini App-এ পাওয়া যাবে।";
  } else if (text.startsWith("/favorites")) {
    reply = "আপনার Favorite Videos Mini App-এ দেখুন।";
  } else if (text.startsWith("/help")) {
    reply = "সহায়তার জন্য VIP Media Hub ব্যবহার করুন।";
  }

  try {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );
  } catch (error) {
    console.error("Telegram reply error:", error.message);
  }
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(
    `VIP Media Hub server running on port ${PORT}`
  );
});
