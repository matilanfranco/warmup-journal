"use client";

import { useEffect, useState } from "react";
import {
  pushStatus, enablePush, disablePush, setReminderHour, loadPushSettings,
  DEFAULT_REMINDER_HOUR, PushStatus,
} from "@/lib/push";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 7:00 → 23:00

const hourLabel = (h: number) =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(new Date(2000, 0, 1, h));

export default function ReminderSettings() {
  const [status, setStatus] = useState<PushStatus | "loading">("loading");
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(DEFAULT_REMINDER_HOUR);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [st, settings] = await Promise.all([pushStatus(), loadPushSettings()]);
      setStatus(st);
      setEnabled(st === "granted" && !!settings?.enabled);
      if (settings?.reminderHour !== undefined) setHour(settings.reminderHour);
    })();
  }, []);

  const turnOn = async () => {
    setBusy(true); setError(null);
    try {
      const st = await enablePush(hour);
      setStatus(st);
      setEnabled(st === "granted");
      if (st === "unsupported") setError("Reminders aren't available on this device.");
    } catch (e) {
      console.error(e);
      setError("Couldn't turn on reminders. Try again.");
    } finally { setBusy(false); }
  };

  const turnOff = async () => {
    setBusy(true);
    try { await disablePush(); setEnabled(false); }
    finally { setBusy(false); }
  };

  const changeHour = async (h: number) => {
    setHour(h);
    if (enabled) await setReminderHour(h).catch(console.error);
  };

  return (
    <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5 mb-4">
      <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-1">Warmup reminder</p>
      <p className="text-[12px] text-[#8FA896] mb-4 leading-relaxed">
        If your warmup isn&apos;t done by this time, you&apos;ll get a nudge. Shows never send reminders.
      </p>

      <div className="flex items-center justify-between rounded-2xl bg-[#F5F2EC] px-4 h-11 mb-3">
        <span className="text-[13px] font-medium text-[#1C2B22]">Remind me at</span>
        <select value={hour} onChange={(e) => changeHour(Number(e.target.value))}
          className="bg-transparent text-[13px] font-semibold text-[#2C5F3F] focus:outline-none">
          {HOURS.map((h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
        </select>
      </div>

      {status === "loading" ? (
        <div className="h-11 rounded-full bg-[#F5F2EC] animate-pulse" />
      ) : status === "unsupported" ? (
        <p className="text-[11px] text-[#8FA896] text-center leading-relaxed">
          On iPhone, add the app to your Home Screen first (Share → Add to Home Screen), then open it from there.
        </p>
      ) : status === "denied" ? (
        <p className="text-[11px] text-rose-500 text-center leading-relaxed">
          Notifications are blocked. Turn them on in Settings → The Daily Singer → Notifications.
        </p>
      ) : enabled ? (
        <button onClick={turnOff} disabled={busy}
          className="w-full h-11 rounded-full bg-[#EAF0EB] border border-[rgba(44,95,63,0.15)] text-[13px] font-semibold text-[#2C5F3F] disabled:opacity-60">
          ✓ Reminders on · tap to turn off
        </button>
      ) : (
        <button onClick={turnOn} disabled={busy}
          className="w-full h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60">
          {busy ? "Turning on..." : "🔔 Turn on reminders"}
        </button>
      )}
      {error && <p className="text-[11px] text-rose-500 text-center mt-2">{error}</p>}
    </div>
  );
}
