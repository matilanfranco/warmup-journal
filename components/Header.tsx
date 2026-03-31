"use client";

import Link from "next/link";

export default function Header() {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="mx-auto max-w-md px-5 pt-5 pb-2 flex items-center justify-between">
      <div>
        <p className="text-xs text-[#8FA896] tracking-widest uppercase font-medium">
          {greeting()}
        </p>
        <p className="text-[15px] font-semibold text-[#1C2B22] tracking-tight">
          Molly
        </p>
      </div>
      <Link href="/about">
        <div className="w-9 h-9 rounded-full bg-[#2C5F3F] flex items-center justify-center text-sm font-bold text-white">
          M
        </div>
      </Link>
    </header>
  );
}