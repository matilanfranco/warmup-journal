"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
        ? "Incorrect email or password."
        : err.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F2EC] flex flex-col items-center justify-center px-6 pb-10">

      {/* Logo + brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-sm mb-4 border border-[rgba(44,95,63,0.1)]">
          <Image src="/icon.png" alt="The Daily Singer" width={80} height={80} className="w-full h-full object-cover" />
        </div>
        <h1
          className="text-[28px] text-[#1C2B22] leading-tight"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}
        >
          The Daily Singer
        </h1>
        <p className="text-[12px] text-[#8FA896] tracking-[3px] uppercase font-medium mt-1">
          voice journal
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-[rgba(44,95,63,0.1)] shadow-sm p-6">
        <h2
          className="text-[20px] text-[#1C2B22] mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Welcome back
        </h2>
        <p className="text-[13px] text-[#8FA896] mb-6">Sign in to your account.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-4 py-3 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] focus:border-[#2C5F3F]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-4 py-3 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)] focus:border-[#2C5F3F]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-[#2C5F3F] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-60 mt-2"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>
      </div>

      <p className="text-[13px] text-[#8FA896] mt-5">
        Don't have an account?{" "}
        <Link href="/register" className="text-[#2C5F3F] font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </main>
  );
}