"use client";

import Link from "next/link";
import HeroCard from "@/components/dashboard/HeroCard";
import CoolDownCard from "@/components/dashboard/CoolDownCard";
import RestDayCard from "@/components/dashboard/RestDayCard";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-5 py-3 pb-8">
      <HeroCard />
      <Link href="/shows"
        className="mx-4 flex items-center justify-between bg-white rounded-2xl border border-[rgba(44,95,63,0.08)] shadow-sm px-5 py-3.5 active:scale-[0.99] transition-transform">
        <span className="text-[13px] text-[#1C2B22]">🎭 Had a show? <span className="text-[#8FA896]">Log it whenever</span></span>
        <span className="text-[13px] font-semibold text-[#2C5F3F]">Shows →</span>
      </Link>
      <CoolDownCard />
      <RestDayCard />
    </main>
  );
}
