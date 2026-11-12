// Web push reminders via Firebase Cloud Messaging.
// The device registers a token here; the server cron (app/api/cron/reminders)
// sends the "warmup not done yet" reminder at the user's chosen local hour.

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { app } from "@/lib/firebase";
import { getPushSettings, savePushSettings, PushSettings } from "@/lib/firebaseService";
import { auth } from "@/lib/firebase";

export const DEFAULT_REMINDER_HOUR = 18;

export type PushStatus = "unsupported" | "default" | "denied" | "granted";

export async function pushStatus(): Promise<PushStatus> {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  if (!(await isSupported().catch(() => false))) return "unsupported";
  return Notification.permission as PushStatus;
}

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("SW registration failed:", e);
    return null;
  }
}

async function currentToken(): Promise<string | null> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set — push reminders disabled.");
    return null;
  }
  const registration = await registerSW();
  if (!registration) return null;
  await navigator.serviceWorker.ready;
  return getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: registration });
}

const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

// Asks for permission (must be called from a tap) and turns reminders on.
export async function enablePush(reminderHour?: number): Promise<PushStatus> {
  const status = await pushStatus();
  if (status === "unsupported") return status;
  const result = await Notification.requestPermission();
  if (result !== "granted") return result as PushStatus;

  const token = await currentToken();
  if (!token) return "unsupported";
  const existing = await getPushSettings();
  await savePushSettings({
    enabled: true,
    tokens: Array.from(new Set([...(existing?.tokens ?? []), token])),
    timeZone: timeZone(),
    reminderHour: reminderHour ?? existing?.reminderHour ?? DEFAULT_REMINDER_HOUR,
  });
  return "granted";
}

export async function disablePush() {
  await savePushSettings({ enabled: false });
}

export async function setReminderHour(hour: number) {
  await savePushSettings({ reminderHour: hour });
}

export async function loadPushSettings(): Promise<PushSettings | null> {
  try { return await getPushSettings(); } catch { return null; }
}

// Called on app start: tokens can rotate and people travel, so keep both fresh.
export async function refreshPush() {
  if (!auth.currentUser) return;
  if ((await pushStatus()) !== "granted") return;
  try {
    const existing = await getPushSettings();
    if (!existing?.enabled) return;
    const token = await currentToken();
    if (!token) return;
    const tz = timeZone();
    if (existing.tokens?.includes(token) && existing.timeZone === tz) return;
    await savePushSettings({
      tokens: Array.from(new Set([...(existing.tokens ?? []), token])),
      timeZone: tz,
    });
  } catch (e) {
    console.error("Push refresh failed:", e);
  }
}
