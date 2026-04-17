"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useAppMode } from "@/lib/AppModeContext";
import { getRecentBreakCheckIns } from "@/lib/firebaseService";
import { getAppDate } from "@/lib/dateUtils";

export default function BreakHeroCard() {
  const { profile } = useAuth();
  const { modeData } = useAppMode();
  const firstName = profile?.firstName ?? "there";

  const [breakStreak, setBreakStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [daysInBreak, setDaysInBreak] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const checkins = await getRecentBreakCheckIns(30);
        const today = getAppDate();
        setCheckedInToday(checkins.some((c) => c.date === today));

        // Streak — consecutive days with check-ins
        let streak = 0;
        let check = new Date();
        if (check.getHours() < 6) check.setDate(check.getDate() - 1);
        const dateSet = new Set(checkins.map((c) => c.date));
        for (let i = 0; i < 30; i++) {
          const y = check.getFullYear();
          const m = String(check.getMonth() + 1).padStart(2, "0");
          const d = String(check.getDate()).padStart(2, "0");
          if (dateSet.has(`${y}-${m}-${d}`)) { streak++; check.setDate(check.getDate() - 1); }
          else break;
        }
        setBreakStreak(streak);
      } catch {}
    }
    load();

    // Days in break
    if (modeData?.currentStartDate) {
      const [y, m, d] = modeData.currentStartDate.split("-").map(Number);
      const start = new Date(y, m - 1, d);
      const now = new Date();
      setDaysInBreak(Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }, [modeData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const todayFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }).format(new Date());

  return (
    <div className="mx-4 rounded-3xl overflow-hidden shadow-sm border border-[rgba(139,94,60,0.15)]">
      {/* BG */}
      <div className="relative px-5 pt-6 pb-5"
        style={{ backgroundImage: "url('/break-bg.png')", backgroundSize: "cover", backgroundPosition: "center top" }}>
        <div className="absolute inset-0" style={{ background: "rgba(255,240,220,0.4)" }} />
        <div className="relative z-10">
          <p className="text-[12px] font-bold text-[#8B5E3C] mb-1">{greeting()}, {firstName} 🌴</p>
          <h1 className="text-[28px] leading-tight text-[#3D1F0A] mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            You're on a break.
          </h1>
          <p className="text-[13px] text-[#8B6A50]">{todayFmt}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white px-5 py-4">
        <div className="flex gap-3 mb-3">
          {[
            { label: "Break day", value: daysInBreak > 0 ? `${daysInBreak}` : "1", sub: "since you started" },
            { label: "Check-ins", value: breakStreak > 0 ? `${breakStreak}` : "—", sub: "day streak" },
            { label: "Today", value: checkedInToday ? "✓" : "—", sub: checkedInToday ? "logged" : "not yet" },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-[10px] text-[#C4A882] tracking-widest uppercase font-medium">{s.label}</p>
              <p className="text-[20px] font-bold text-[#3D1F0A] mt-0.5">{s.value}</p>
              <p className="text-[10px] text-[#C4A882]">{s.sub}</p>
            </div>
          ))}
        </div>

        {!checkedInToday && (
          <div className="mt-3 pt-3 border-t border-[rgba(139,94,60,0.07)]">
            <p className="text-[12px] text-[#C4A882] text-center">
              No check-in today yet — that's okay 🍊
            </p>
          </div>
        )}
      </div>
    </div>
  );
}