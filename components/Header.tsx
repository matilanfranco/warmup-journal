"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: "/", label: "Dashboard" },
      { href: "/warmups", label: "Warmups" },
      { href: "/history", label: "History" },
      { href: "/about", label: "About" },
    ],
    []
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-emerald-950 border-b border-emerald-900/10 dark:border-emerald-800/40">
      <nav className="mx-auto max-w-4xl px-4">

        {/* Main row */}
        <div className="flex items-center justify-between gap-3 py-3">

          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-700 flex items-center justify-center text-lg shrink-0">
              🌿
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-emerald-950 dark:text-emerald-50 tracking-tight">
                The Daily Singer
              </div>
              <div className="text-[10px] font-bold tracking-[2px] uppercase text-emerald-600 dark:text-emerald-400">
                voice journal
              </div>
            </div>
          </Link>

          {/* Desktop: nav + date */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "inline-flex h-9 items-center rounded-full px-4 text-sm font-bold transition-colors",
                      active
                        ? "bg-emerald-700 text-white"
                        : "text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900",
                    ].join(" ")}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Date block */}
            <div className="border-l border-emerald-900/10 dark:border-emerald-700/40 pl-5 text-right">
              <p className="text-[10px] font-bold tracking-wide text-emerald-500 dark:text-emerald-400">
                {greeting()}, Molly
              </p>
              <p className="text-[13px] font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Mobile: date + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold tracking-wide text-emerald-500">
                {greeting()}
              </p>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                {new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date())}
              </p>
            </div>

            <button
              onClick={() => setIsOpen((v) => !v)}
              className="w-10 h-10 rounded-xl border border-emerald-900/10 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900 flex items-center justify-center active:scale-95"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-4">
                <span className={["absolute left-0 top-0 h-[2px] w-5 rounded-full bg-emerald-800 dark:bg-emerald-300 transition-all duration-200", isOpen ? "translate-y-[7px] rotate-45" : ""].join(" ")} />
                <span className={["absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-emerald-800 dark:bg-emerald-300 transition-all duration-200", isOpen ? "opacity-0" : "opacity-100"].join(" ")} />
                <span className={["absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-emerald-800 dark:bg-emerald-300 transition-all duration-200", isOpen ? "-translate-y-[7px] -rotate-45" : ""].join(" ")} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pb-4 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={[
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors",
                        active
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-50 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900",
                      ].join(" ")}
                    >
                      <span>{item.label}</span>
                      <span className="opacity-50 text-xs">→</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </header>
  );
}