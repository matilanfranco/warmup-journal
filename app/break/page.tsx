"use client";

import BreakCheckInCard from "@/components/break/BreakCheckInCard";
import BreakHeroCard from "@/components/break/BreakHeroCard";

export default function BreakPage() {
  return (
    <main className="flex flex-col gap-5 py-3 pb-8" style={{ background: "#FDF6EE", minHeight: "100vh" }}>
      <BreakHeroCard />
      <BreakCheckInCard />
    </main>
  );
}