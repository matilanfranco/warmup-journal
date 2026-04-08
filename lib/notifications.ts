const WARMUP_NOTIF_KEY = "warmupNotifScheduled";
const SHOWS_NOTIF_KEY = "showsNotifScheduled";
const DAILY_NOTIF_KEY = "dailyNotifScheduled";

export async function registerSW() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("SW registration failed:", e);
  }
}

export async function requestPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function hasPermission(): boolean {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

async function showNotification(title: string, body: string, tag: string) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body, tag,
      icon: "/icon.png",
      badge: "/icon.png",
      vibrate: [100, 50, 100],
    } as any);
  } catch (e) {
    console.error("Notification error:", e);
  }
}

// ── Warmup reminder — 1hr after starting ─────────────────────
export function scheduleWarmupReminder() {
  if (typeof window === "undefined") return;
  const alreadyScheduled = sessionStorage.getItem(WARMUP_NOTIF_KEY);
  if (alreadyScheduled) return;
  sessionStorage.setItem(WARMUP_NOTIF_KEY, "1");

  setTimeout(async () => {
    try {
      const raw = localStorage.getItem("warmupProgress");
      if (raw) {
        const state = JSON.parse(raw);
        if (state.completed) return;
      }
    } catch {}
    if (!hasPermission()) return;
    await showNotification(
      "🎤 Still warming up?",
      "You started your warmup but didn't finish! Completing it helps track your voice progress 🌿",
      "warmup-reminder"
    );
  }, 60 * 60 * 1000);
}

// ── Shows reminder — midnight if no shows ────────────────────
export function scheduleShowsReminder() {
  if (typeof window === "undefined") return;
  const todayKey = new Date().toISOString().split("T")[0];
  const lastScheduled = localStorage.getItem(SHOWS_NOTIF_KEY);
  if (lastScheduled === todayKey) return;
  localStorage.setItem(SHOWS_NOTIF_KEY, todayKey);

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      const raw = localStorage.getItem("showsLogged");
      if (raw === todayKey) return;
    } catch {}
    if (!hasPermission()) return;
    await showNotification(
      "🎭 Don't forget your shows! 💕",
      "You haven't logged tonight's performances yet. A quick entry helps you track your journey 🌟✨",
      "shows-reminder"
    );
  }, msUntilMidnight);
}

// ── Daily 10pm reminder — if no warmup logged ────────────────
export function scheduleDailyReminder() {
  if (typeof window === "undefined") return;
  const todayKey = new Date().toISOString().split("T")[0];
  const lastScheduled = localStorage.getItem(DAILY_NOTIF_KEY);
  if (lastScheduled === todayKey) return;
  localStorage.setItem(DAILY_NOTIF_KEY, todayKey);

  const now = new Date();
  const tenPM = new Date();
  tenPM.setHours(22, 0, 0, 0);

  // If already past 10pm today, skip
  if (now >= tenPM) return;
  const msUntil10PM = tenPM.getTime() - now.getTime();

  setTimeout(async () => {
    // Check if warmup was done today
    try {
      const raw = localStorage.getItem("warmupProgress");
      if (raw) {
        const state = JSON.parse(raw);
        if (state.date === todayKey && state.completed) return;
      }
    } catch {}
    if (!hasPermission()) return;
    await showNotification(
      "🌊 Haven't seen you today!",
      "Is today a rest day? Don't forget to log in and check how your week went 💙✨",
      "daily-reminder"
    );
  }, msUntil10PM);
}

export function markShowsLogged() {
  if (typeof window === "undefined") return;
  const todayKey = new Date().toISOString().split("T")[0];
  localStorage.setItem("showsLogged", todayKey);
}