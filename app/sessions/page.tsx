"use client";

import { useState } from "react";
import WarmupRoutineList from "@/components/routines/WarmupRoutineList";
import CooldownRoutineCard from "@/components/routines/CooldownRoutineCard";

export default function RoutinesPage() {
  const [tab, setTab] = useState<"warmup" | "cooldown">("warmup");
  const isCooldown = tab === "cooldown";

  return (
    <main className={`min-h-screen ${isCooldown ? "bg-[#F0EDF8]" : "bg-[#F5F2EC]"} transition-colors duration-300`}>
      <div className="mx-auto max-w-md px-4 pt-2 pb-28">
        <div className="mb-5">
          <h1 className="text-[28px] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400,
              color: isCooldown ? "#2D2650" : "#1C2B22" }}>
            Routines
          </h1>
          <p className="text-[13px]" style={{ color: isCooldown ? "#9B8EC4" : "#8FA896" }}>
            {isCooldown ? "Wind down after singing." : "Your warmups, your way."}
          </p>
        </div>

        <div className={`flex gap-1 p-1 rounded-2xl mb-6 ${isCooldown ? "bg-[#E4DEF4]" : "bg-[#E8EFE9]"}`}>
          <button onClick={() => setTab("warmup")}
            className={`flex-1 h-9 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] ${
              !isCooldown ? "bg-white text-[#2C5F3F] shadow-sm" : "text-[#9B8EC4] hover:text-[#6B5B9E]"
            }`}>
            🔥 Warmup
          </button>
          <button onClick={() => setTab("cooldown")}
            className={`flex-1 h-9 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] ${
              isCooldown ? "bg-white text-[#6B5B9E] shadow-sm" : "text-[#5A7A65] hover:text-[#2C5F3F]"
            }`}>
            🌙 Cool down
          </button>
        </div>

        {isCooldown ? <CooldownRoutineCard /> : <WarmupRoutineList />}
      </div>
    </main>
  );
}
