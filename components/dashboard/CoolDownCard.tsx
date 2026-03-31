"use client";

import Link from "next/link";

const TAGS = ["Breath release", "Soft hum", "Jaw relax", "~10 min"];

export default function CoolDownCard() {
  return (
    <div className="mx-4 rounded-3xl overflow-hidden shadow-sm border border-white/40">

      {/* Background image area */}
      <div
        className="relative px-5 pt-6 pb-5"
        style={{
          backgroundImage: "url('/cooldown-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        {/* Overlay — lavender tint so text is readable */}
        <div className="absolute inset-0" style={{ background: "rgba(45, 38, 80, 0.45)" }} />

        <div className="relative z-10">
          {/* Label */}
          <p className="text-[10px] font-black tracking-[3px] uppercase text-[#C4B8E8] mb-3">
            🌙 Cool down
          </p>

          {/* Title */}
          <h2
            className="text-[26px] leading-tight mb-2 text-white"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}
          >
            Rest your voice.
          </h2>

          <p className="text-[13px] text-[#C4B8E8] mb-5">
            Guided rest · breath · release
          </p>

          {/* CTA */}
          <Link
            href="/cooldown"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-full text-[15px] font-semibold tracking-wide active:scale-[0.98] transition-transform text-white"
            style={{ background: "rgba(107, 91, 158, 0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(196,184,232,0.3)" }}
          >
            Begin session →
          </Link>

          {/* Secondary row — tags + customize */}
          <div className="flex gap-2 mt-3">
            <div className="flex-1 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full text-[11px] font-medium"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#E8E0F8", border: "1px solid rgba(196,184,232,0.2)", backdropFilter: "blur(4px)" }}
                >
                  {t}
                </span>
              ))}
            </div>
            <Link
              href="/cooldown/routine"
              className="shrink-0 flex items-center justify-center h-9 px-4 rounded-full text-[12px] font-medium whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.12)", color: "#E8E0F8", border: "1px solid rgba(196,184,232,0.2)", backdropFilter: "blur(4px)" }}
            >
              Customize
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}