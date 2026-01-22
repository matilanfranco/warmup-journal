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
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-emerald-200/80 backdrop-blur-md">
      <nav className="mx-auto max-w-4xl px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-950/90"
            onClick={() => setIsOpen(false)}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 border border-emerald-900/10 shadow-sm">
              🌿🎤
            </span>
            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight">
                The Daily Singer
              </div>
              <div className="text-[11px] font-bold text-emerald-900/70">
                daily voice routine
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-extrabold transition",
                    active
                      ? "bg-white/80 text-emerald-950 shadow-sm border border-emerald-900/10"
                      : "text-emerald-950/80 hover:text-emerald-950 hover:bg-white/40",
                  ].join(" ")}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-900/10 bg-white/70 shadow-sm active:scale-[0.98]"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className="relative h-4 w-5">
              <span
                className={[
                  "absolute left-0 top-0 h-[2px] w-5 rounded-full bg-emerald-950/80 transition",
                  isOpen ? "translate-y-[7px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-emerald-950/80 transition",
                  isOpen ? "opacity-0" : "opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-emerald-950/80 transition",
                  isOpen ? "translate-y-[-7px] -rotate-45" : "",
                ].join(" ")}
              />
            </div>
          </button>
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
              <div className="mt-3 rounded-3xl border border-emerald-900/10 bg-white/70 p-3 shadow-sm">
                <div className="grid gap-2">
                  {navItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={[
                          "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                          active
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white/80 text-emerald-950 hover:bg-emerald-50",
                        ].join(" ")}
                      >
                        <span>{item.label}</span>
                        <span className="text-xs opacity-80">→</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <div className="text-xs font-bold text-emerald-900/80">
                    Tip
                  </div>
                  <div className="text-xs text-emerald-950/80">
                    keep it short, stay consistent
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}