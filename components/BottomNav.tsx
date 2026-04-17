"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 8.5L10 3L17 8.5V17H13V13H7V17H3V8.5Z"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5" strokeLinejoin="round"
          fill={active ? (cd ? "rgba(155,142,196,0.15)" : "rgba(44,95,63,0.1)") : "none"} />
      </svg>
    ),
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5"
          fill={active ? (cd ? "rgba(155,142,196,0.15)" : "rgba(44,95,63,0.1)") : "none"} />
        <circle cx="10" cy="10" r="3"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5" />
        <path d="M10 3V5M10 15V17M3 10H5M15 10H17"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Log",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="2" width="12" height="16" rx="2.5"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5"
          fill={active ? (cd ? "rgba(155,142,196,0.15)" : "rgba(44,95,63,0.1)") : "none"} />
        <path d="M7.5 7H12.5M7.5 10H12.5M7.5 13H10"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/about",
    label: "Insights",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 14L7 10L10 12L13 7L16 9"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 17H16"
          stroke={active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896"}
          strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isCooldown = pathname.startsWith("/cooldown");
  const isBreak = pathname.startsWith("/break");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <div className={`border-t px-2 pb-6 pt-2 transition-colors duration-300 ${
          isCooldown
            ? "bg-[#2D2650]/95 backdrop-blur-md border-[rgba(180,160,220,0.15)]"
            : isBreak
            ? "bg-[#FFF8F0]/95 backdrop-blur-md border-[rgba(139,94,60,0.1)]"
            : "bg-white/95 backdrop-blur-md border-[rgba(44,95,63,0.08)]"
        }`}>
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link key={tab.href} href={tab.href}
                  className="flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all active:scale-95">
                  {tab.icon(active, isCooldown)}
                  <span className={`text-[10px] font-medium tracking-wide transition-colors ${
                    active
                      ? isCooldown ? "text-[#C4B8E8]" : "text-[#2C5F3F]"
                      : "text-[#8FA896]"
                  }`}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}