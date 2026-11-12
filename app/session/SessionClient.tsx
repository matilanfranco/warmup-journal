"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SessionRunner from "@/components/session/SessionRunner";
import PreWarmupCheck from "@/components/session/PreWarmupCheck";
import { listRoutines, pickSelected, WarmupRoutine } from "@/lib/routines";

type Screen = "check" | "runner";

export default function SessionClient() {
  const requestedId = useSearchParams().get("routine");
  const [routine, setRoutine] = useState<WarmupRoutine | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("check");
  const [showCheckInSummary, setShowCheckInSummary] = useState(false);

  useEffect(() => {
    listRoutines()
      .then((all) => setRoutine(all.find((r) => r.id === requestedId) ?? pickSelected(all)))
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, [requestedId]);

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-4 pb-28">

        <div className="flex items-center justify-between mb-6">
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5A7A65] hover:text-[#2C5F3F] transition-colors">
            ← Back
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0EB] text-[11px] font-semibold text-[#2C5F3F] border border-[rgba(44,95,63,0.15)]">
            🎤 Session
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-[26px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}>
            Today&apos;s warmup
          </h1>
          <p className="text-[13px] text-[#8FA896]">{routine?.name ?? ""}</p>
        </div>

        {!loaded ? (
          <div className="h-40 rounded-3xl bg-white animate-pulse" />
        ) : !routine ? (
          <div className="bg-white rounded-3xl p-6 border border-[rgba(44,95,63,0.08)] shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-xl mx-auto mb-3">🎤</div>
            <p className="text-[14px] font-semibold text-[#1C2B22] mb-1">No routines created yet</p>
            <p className="text-[12px] text-[#8FA896] mb-4">Create your first routine to start warming up.</p>
            <Link href="/warmups/routine" className="inline-flex h-9 items-center px-5 rounded-full bg-[#2C5F3F] text-white text-[12px] font-semibold">
              Create routine →
            </Link>
          </div>
        ) : screen === "check" ? (
          <PreWarmupCheck
            onStart={() => setScreen("runner")}
            onLater={() => { setShowCheckInSummary(true); setScreen("runner"); }}
          />
        ) : (
          <SessionRunner
            routine={routine}
            showCheckInButton={showCheckInSummary}
            onOpenCheckIn={() => { setShowCheckInSummary(false); setScreen("check"); }}
          />
        )}
      </div>
    </main>
  );
}
