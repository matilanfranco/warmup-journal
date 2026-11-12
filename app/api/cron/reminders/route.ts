// Hourly job: sends the "warmup not done yet" push to every user whose local
// reminder hour has passed today and who hasn't saved today's warmup.
// Triggered by .github/workflows/reminders.yml (or any cron) with
// `Authorization: Bearer <CRON_SECRET>`.

import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function admin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return { db: getFirestore(), messaging: getMessaging() };
}

// Local hour + app date (the day rolls over at 6 AM, same as the app).
function localNow(timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  const hour = Number(parts.hour);
  const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  if (hour < 6) date.setUTCDate(date.getUTCDate() - 1);
  return { hour, appDate: date.toISOString().slice(0, 10) };
}

const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

type PushDoc = {
  enabled?: boolean;
  tokens?: string[];
  timeZone?: string;
  reminderHour?: number;
  lastSentDate?: string | null;
};

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db, messaging } = admin();
  const userRefs = await db.collection("users").listDocuments();
  if (userRefs.length === 0) return NextResponse.json({ checked: 0, sent: 0 });

  const pushSnaps = await db.getAll(...userRefs.map((u) => u.collection("settings").doc("push")));
  let sent = 0;

  await Promise.all(pushSnaps.map(async (snap) => {
    const s = snap.data() as PushDoc | undefined;
    if (!s?.enabled || !s.tokens?.length) return;

    let local;
    try { local = localNow(s.timeZone || "UTC"); } catch { local = localNow("UTC"); }
    // Hours 0-5 still belong to the previous app day — too late to nudge.
    if (local.hour < 6 || local.hour < (s.reminderHour ?? 18)) return;
    if (s.lastSentDate === local.appDate) return;

    const userRef = snap.ref.parent.parent!;
    const warmup = await userRef.collection("sessions").doc(local.appDate).get();
    if (warmup.exists) return;

    const res = await messaging.sendEachForMulticast({
      tokens: s.tokens,
      data: {
        title: "🎤 Your warmup is waiting",
        body: "You haven't finished today's warmup yet. A few minutes keeps your voice happy 🌿",
        tag: "warmup-reminder",
        url: "/",
      },
      webpush: { headers: { Urgency: "high", TTL: "14400" } },
    });

    const dead = res.responses
      .map((r, i) => (!r.success && DEAD_TOKEN_CODES.has(r.error?.code ?? "") ? s.tokens![i] : null))
      .filter((t): t is string => t !== null);

    sent += res.successCount;
    await snap.ref.set({
      lastSentDate: local.appDate,
      tokens: s.tokens.filter((t) => !dead.includes(t)),
    }, { merge: true });
  }));

  return NextResponse.json({ checked: pushSnaps.length, sent });
}
