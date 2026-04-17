"use client";

import { useAppMode } from "@/lib/AppModeContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HeroCard from "@/components/dashboard/HeroCard";
import TodayShowsCard from "@/components/dashboard/TodayShowsCard";
import CoolDownCard from "@/components/dashboard/CoolDownCard";
import RestDayCard from "@/components/dashboard/RestDayCard";
import MissedShowsCard from "@/components/dashboard/MissedShowsCard";

export default function HomePage() {
  const { mode, loading } = useAppMode();
  const router = useRouter();

  useEffect(() => {
    if (!loading && mode === "break") router.replace("/break");
  }, [mode, loading]);

  if (loading || mode === "break") return null;

  return (
    <main className="flex flex-col gap-5 py-3 pb-8">
      <HeroCard />
      <TodayShowsCard />
      <CoolDownCard />
      <RestDayCard />
      <MissedShowsCard />
    </main>
  );
}