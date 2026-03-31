"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SessionRunner from "@/components/session/SessionRunner";

export default function SessionClient() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routine") ?? "personal";
  const routineLabel =
    routineId === "personal" ? "Your routine" : routineId.replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-4 pb-28">

        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5A7A65] hover:text-[#2C5F3F] transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0EB] text-[11px] font-semibold text-[#2C5F3F] border border-[rgba(44,95,63,0.15)]">
            🎤 Session
          </span>
        </div>

        <div className="mb-6">
          <h1
            className="text-[26px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}
          >
            Today's warmup
          </h1>
          <p className="text-[13px] text-[#8FA896]">
            {routineLabel}
          </p>
        </div>

        <SessionRunner routineId={routineId} />
      </div>
    </main>
  );
}