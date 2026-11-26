// =====================================
// VIP MEDIA HUB
// TELEGRAM MINI APP INTEGRATION
// =====================================

const telegram = window.Telegram?.WebApp;

// =====================================
// INITIALIZE TELEGRAM
// =====================================

export function initializeTelegram() {
  if (!telegram) {
    console.warn("Telegram WebApp is not available.");
    return false;
  }

  telegram.ready();
  telegram.expand();

  if (telegram.setHeaderColor) {
    telegram.setHeaderColor("#080808");
  }

  if (telegram.setBackgroundColor) {
    telegram.setBackgroundColor("#080808");
  }

  return true;
}

// =====================================
// GET TELEGRAM USER
// =====================================

export function getTelegramUser() {
  return telegram?.initDataUnsafe?.user || null;
}

// =====================================
// GET TELEGRAM INIT DATA
// =====================================

export function getTelegramInitData() {
  return telegram?.initData || "";
}

// =====================================
// CHECK TELEGRAM ENVIRONMENT
// =====================================

export function isTelegramApp() {
  return Boolean(telegram?.initData);
}

// =====================================
// HAPTIC FEEDBACK
// =====================================

export function hapticFeedback(type = "light") {
  if (!telegram?.HapticFeedback) return;

  if (type === "success") {
    telegram.HapticFeedback.notificationOccurred("success");
    return;
  }

  if (type === "error") {
    telegram.HapticFeedback.notificationOccurred("error");
    return;
  }

  if (type === "warning") {
    telegram.HapticFeedback.notificationOccurred("warning");
    return;
  }

  telegram.HapticFeedback.impactOccurred(type);
}

// =====================================
// BACK BUTTON
// =====================================

export function showTelegramBackButton(callback) {
  if (!telegram?.BackButton) return;

  telegram.BackButton.show();
  telegram.BackButton.onClick(callback);
}

export function hideTelegramBackButton(callback) {
  if (!telegram?.BackButton) return;

  if (callback) {
    telegram.BackButton.offClick(callback);
  }

  telegram.BackButton.hide();
}

// =====================================
// MAIN BUTTON
// =====================================

export function showTelegramMainButton(
  text,
  callback
) {
  if (!telegram?.MainButton) return;

  telegram.MainButton.setText(text);
  telegram.MainButton.show();
  telegram.MainButton.onClick(callback);
}

export function hideTelegramMainButton(callback) {
  if (!telegram?.MainButton) return;

  if (callback) {
    telegram.MainButton.offClick(callback);
  }

  telegram.MainButton.hide();
}

// =====================================
// SHARE LINK
// =====================================

export function shareTelegramLink(url, text = "") {
  if (telegram?.openTelegramLink) {
    const shareUrl =
      "https://t.me/share/url?url=" +
      encodeURIComponent(url) +
      "&text=" +
      encodeURIComponent(text);

    telegram.openTelegramLink(shareUrl);
    return;
  }

  if (navigator.share) {
    navigator.share({
      title: "VIP Media Hub",
      text,
      url
    });
  }
}

// =====================================
// CLOSE MINI APP
// =====================================

export function closeTelegramApp() {
  telegram?.close();
}

// =====================================
// OPEN TELEGRAM LINK
// =====================================

export function openTelegramLink(url) {
  if (!telegram?.openTelegramLink) return;

  telegram.openTelegramLink(url);
}

// =====================================
// TELEGRAM THEME
// =====================================

export function getTelegramTheme() {
  return telegram?.themeParams || {};
}

// =====================================
// PLATFORM INFORMATION
// =====================================

export function getTelegramPlatform() {
  return telegram?.platform || "unknown";
}
