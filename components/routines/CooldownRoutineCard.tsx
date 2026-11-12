"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAudioById } from "@/components/data/audioLibrary";
import { getCooldownIds } from "@/lib/cooldown";

export default function CooldownRoutineCard() {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => { getCooldownIds().then(setIds); }, []);

  if (ids === null) return <div className="h-40 rounded-3xl bg-white animate-pulse" />;

  if (ids.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[rgba(107,91,158,0.1)] shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#EDE8F8] flex items-center justify-center text-xl mx-auto mb-3">🌙</div>
        <p className="text-[15px] font-semibold text-[#2D2650] mb-1">No cool down yet</p>
        <p className="text-[12px] text-[#9B8EC4] mb-5">Pick the exercises you use to wind down after singing.</p>
        <Link href="/cooldown/routine"
          className="inline-flex h-11 items-center px-6 rounded-full bg-[#6B5B9E] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform">
          + Create cool down
        </Link>
      </div>
    );
  }

  const items = ids.map(getAudioById).filter((x): x is NonNullable<typeof x> => !!x);
  const min = Math.max(1, Math.round(items.reduce((a, i) => a + i.durationSec, 0) / 60));

  return (
    <div className="bg-white rounded-3xl border border-[rgba(107,91,158,0.1)] shadow-sm p-5">
      <h2 className="text-[20px] text-[#2D2650] leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
        Your cool down
      </h2>
      <p className="text-[11px] text-[#9B8EC4] mb-3">
        {items.length} exercise{items.length !== 1 ? "s" : ""} · ~{min} min
      </p>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {items.map((it, i) => (
          <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EDE8F8] text-[#4A3D7A] border border-[rgba(107,91,158,0.15)]">
            {it.name}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Link href="/cooldown"
          className="flex-1 h-10 rounded-full bg-[#6B5B9E] text-white text-[13px] font-semibold flex items-center justify-center active:scale-[0.98] transition-transform">
          Start →
        </Link>
        <Link href="/cooldown/routine"
          className="h-10 px-5 rounded-full border text-[13px] font-medium flex items-center justify-center bg-[#EDE8F8] text-[#4A3D7A] border-[rgba(107,91,158,0.15)]">
          Edit
        </Link>
      </div>
    </div>
  );
}
