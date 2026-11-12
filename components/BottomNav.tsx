"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const stroke = (active: boolean, cd: boolean) => (active ? (cd ? "#9B8EC4" : "#2C5F3F") : "#8FA896");
const fill = (active: boolean, cd: boolean) => (active ? (cd ? "rgba(155,142,196,0.15)" : "rgba(44,95,63,0.1)") : "none");

const tabs = [
  {
    href: "/",
    label: "Today",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 8.5L10 3L17 8.5V17H13V13H7V17H3V8.5Z"
          stroke={stroke(active, cd)} strokeWidth="1.5" strokeLinejoin="round" fill={fill(active, cd)} />
      </svg>
    ),
  },
  {
    href: "/shows",
    label: "Shows",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="7" y="2.5" width="6" height="9" rx="3"
          stroke={stroke(active, cd)} strokeWidth="1.5" fill={fill(active, cd)} />
        <path d="M4.5 9.5C4.5 12.5 7 14.5 10 14.5C13 14.5 15.5 12.5 15.5 9.5M10 14.5V17.5M7 17.5H13"
          stroke={stroke(active, cd)} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="2.5"
          stroke={stroke(active, cd)} strokeWidth="1.5" fill={fill(active, cd)} />
        <path d="M3 8H17M7 2.5V5.5M13 2.5V5.5"
          stroke={stroke(active, cd)} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/sessions",
    label: "Routines",
    icon: (active: boolean, cd: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke={stroke(active, cd)} strokeWidth="1.5" fill={fill(active, cd)} />
        <path d="M8.5 7.2V12.8L13 10L8.5 7.2Z" stroke={stroke(active, cd)} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isCooldown = pathname.startsWith("/cooldown");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md">
        <div className={`border-t px-2 pb-6 pt-2 transition-colors duration-300 ${
          isCooldown
            ? "bg-[#2D2650]/95 backdrop-blur-md border-[rgba(180,160,220,0.15)]"
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