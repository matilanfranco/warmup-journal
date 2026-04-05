// ─── Notification utility ────────────────────────────────────
// Works with PWA installed + service worker active

const WARMUP_NOTIF_KEY = "warmupNotifScheduled";
const SHOWS_NOTIF_KEY = "showsNotifScheduled";

// Register service worker
export async function registerSW() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("SW registration failed:", e);
  }
}

// Request notification permission
export async function requestPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

// Show a notification via service worker
async function showNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(title, {
    body,
    tag,
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: [100, 50, 100],
  } as any);
}

// ── Warmup reminder — fires 1hr after calling this ───────────
export function scheduleWarmupReminder() {
  if (typeof window === "undefined") return;
  const alreadyScheduled = sessionStorage.getItem(WARMUP_NOTIF_KEY);
  if (alreadyScheduled) return;

  sessionStorage.setItem(WARMUP_NOTIF_KEY, "1");

  setTimeout(async () => {
    // Check if warmup was completed
    try {
      const raw = localStorage.getItem("warmupProgress");
      if (raw) {
        const state = JSON.parse(raw);
        if (state.completed) return; // Already done, no notification
      }
    } catch {}

    const granted = await requestPermission();
    if (!granted) return;

    await showNotification(
      "🎤 Still warming up?",
      "You started your warmup but didn't finish! Completing it helps track your voice progress 🌿",
      "warmup-reminder"
    );
  }, 60 * 60 * 1000); // 1 hour
}

// ── Shows reminder — checks at midnight if no shows logged ───
export function scheduleShowsReminder() {
  if (typeof window === "undefined") return;

  const todayKey = new Date().toISOString().split("T")[0];
  const lastScheduled = localStorage.getItem(SHOWS_NOTIF_KEY);
  if (lastScheduled === todayKey) return;

  localStorage.setItem(SHOWS_NOTIF_KEY, todayKey);

  // Calculate ms until midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(async () => {
    // Check if any shows were logged today
    try {
      const raw = localStorage.getItem("showsLogged");
      if (raw === todayKey) return; // Shows were logged
    } catch {}

    const granted = await requestPermission();
    if (!granted) return;

    await showNotification(
      "🎭 Don't forget your shows! 💕",
      "You haven't logged tonight's performances yet. A quick entry helps you track your journey 🌟✨",
      "shows-reminder"
    );
  }, msUntilMidnight);
}

// Call this when shows are saved (to cancel reminder)
export function markShowsLogged() {
  if (typeof window === "undefined") return;
  const todayKey = new Date().toISOString().split("T")[0];
  localStorage.setItem("showsLogged", todayKey);
}