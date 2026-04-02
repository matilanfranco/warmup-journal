"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const isCooldown = pathname.startsWith("/cooldown");
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  const navItems = useMemo(() => [
    { href: "/", label: "Home" },
    { href: "/sessions", label: "Sessions" },
    { href: "/history", label: "Log" },
    { href: "/about", label: "Insights" },
  ], []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const todayShort = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric",
  }).format(new Date());

  const firstName = profile?.firstName ?? user?.email?.split("@")[0] ?? "Molly";
  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] ?? "M").toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const cd = {
    bg: "bg-[#2D2650]", border: "border-[rgba(180,160,220,0.15)]",
    name: "text-[#E8E0F8]", sub: "text-[#9B8EC4]", greeting: "text-[#9B8EC4]", date: "text-[#C4B8E8]",
    navActive: "bg-[#4A3D7A] text-[#E8E0F8]", navInactive: "text-[#9B8EC4] hover:bg-[#3D3468]",
    hamburger: "border-[rgba(180,160,220,0.2)] bg-[#3D3468]", hamburgerBar: "bg-[#C4B8E8]",
    mobileActive: "bg-[#4A3D7A] text-[#E8E0F8]", mobileInactive: "bg-[#3D3468] text-[#C4B8E8]",
    divider: "border-[rgba(180,160,220,0.1)]",
    avatar: "bg-[#4A3D7A] text-[#C4B8E8] border-[rgba(180,160,220,0.2)]",
  };

  const wm = {
    bg: "bg-white", border: "border-[rgba(44,95,63,0.1)]",
    name: "text-[#1C2B22]", sub: "text-[#5A8A6A]", greeting: "text-[#5A8A6A]", date: "text-[#8FA896]",
    navActive: "bg-[#2C5F3F] text-white", navInactive: "text-[#5A7A65] hover:bg-[#EAF0EB]",
    hamburger: "border-[rgba(44,95,63,0.15)] bg-[#EAF0EB]", hamburgerBar: "bg-[#2C5F3F]",
    mobileActive: "bg-[#2C5F3F] text-white", mobileInactive: "bg-[#F5F2EC] text-[#1C2B22]",
    divider: "border-[rgba(44,95,63,0.08)]",
    avatar: "bg-[#EAF0EB] text-[#2C5F3F] border-[rgba(44,95,63,0.2)]",
  };

  const p = isCooldown ? cd : wm;

  // Hide header on public routes
  if (isPublic) return null;

  return (
    <header className={`sticky top-0 z-50 ${p.bg} border-b ${p.border} transition-colors duration-300`}>
      <nav className="mx-auto max-w-md px-4">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setIsOpen(false)}>
            <div className={`w-8 h-8 rounded-xl border overflow-hidden flex items-center justify-center ${
              isCooldown ? "border-[rgba(180,160,220,0.2)]" : "border-[rgba(44,95,63,0.15)]"
            }`}>
              <Image src="/icon.png" alt="The Daily Singer" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className={`text-[13px] font-bold tracking-tight ${p.name}`}>The Daily Singer</div>
              <div className={`text-[9px] font-black tracking-[2px] uppercase ${p.sub}`}>
                {isCooldown ? "cool down" : "voice journal"}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`h-8 px-3.5 rounded-full text-sm font-bold transition-colors flex items-center ${
                    active ? p.navActive : p.navInactive
                  }`}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop right — date + avatar */}
          <div className={`hidden md:flex items-center gap-3 border-l ${p.divider} pl-4 shrink-0`}>
            <div className="text-right leading-tight">
              <p className={`text-[10px] font-bold tracking-wide whitespace-nowrap ${p.greeting}`}>
                {greeting()}, {firstName}
              </p>
              <p className={`text-[12px] font-bold whitespace-nowrap ${p.name}`}>{todayShort}</p>
            </div>
            <Link href="/profile"
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 transition-opacity hover:opacity-70 ${p.avatar}`}>
              {initials}
            </Link>
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-2.5">
            <div className="text-right">
              <p className={`text-[9px] font-bold tracking-wide uppercase ${p.greeting}`}>{greeting()}</p>
              <p className={`text-[11px] font-bold leading-tight ${p.name}`}>{todayShort}</p>
            </div>
            <button
              onClick={() => setIsOpen((v) => !v)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center active:scale-95 transition-transform ${p.hamburger}`}>
              <div className="relative w-4 h-3">
                <span className={`absolute left-0 top-0 h-[1.5px] w-4 rounded-full transition-all duration-200 ${p.hamburgerBar} ${isOpen ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute left-0 top-[5px] h-[1.5px] w-4 rounded-full transition-all duration-200 ${p.hamburgerBar} ${isOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute left-0 top-[10px] h-[1.5px] w-4 rounded-full transition-all duration-200 ${p.hamburgerBar} ${isOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}
              className="md:hidden overflow-hidden">
              <div className={`pb-3 space-y-1 border-t ${p.divider} pt-2`}>
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                        active ? p.mobileActive : p.mobileInactive
                      }`}>
                      <span>{item.label}</span>
                      <span className="opacity-40 text-xs">→</span>
                    </Link>
                  );
                })}
                <Link href="/profile" onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${p.mobileInactive}`}>
                  <span>Profile</span>
                  <span className="opacity-40 text-xs">→</span>
                </Link>
                <button onClick={handleSignOut}
                  className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${p.mobileInactive}`}>
                  <span>Sign out</span>
                  <span className="opacity-40 text-xs">→</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}