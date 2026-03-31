"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CoolDownRunner from "@/components/cooldown/CoolDownRunner";

export default function CoolDownClient() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routine") ?? "cd-personal";
  const routineLabel = routineId === "cd-personal" ? "Your cool down" : routineId.replace(/cd-/g, "").replace(/-/g, " ");

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: "#EEF2F9" }}>

      {/* Background image — top portion */}
      <div
        className="absolute top-0 left-0 right-0 h-56 z-0"
        style={{
          backgroundImage: "url('/cooldown-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#EEF2F9]" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 pt-4 pb-28">

        <div className="flex items-center justify-between mb-6">
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9B8EC4] hover:text-[#6B5B9E] transition-colors">
            ← Back
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D2650]/60 text-[11px] font-semibold text-[#C4B8E8] border border-[rgba(180,160,220,0.2)] backdrop-blur-sm">
            🌙 Cool down
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-[26px] text-[#1E1535] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}>
            Rest your voice.
          </h1>
          <p className="text-[13px] text-[#7A6B9E]">{routineLabel}</p>
        </div>

        <CoolDownRunner routineId={routineId} />
      </div>
    </main>
  );
}