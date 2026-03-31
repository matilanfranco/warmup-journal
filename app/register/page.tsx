"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const VOICE_TYPES = ["Soprano", "Mezzo-soprano", "Contralto", "Tenor", "Baritone", "Bass"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const goNext = () => { setError(""); setStep((s) => s + 1); };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        firstName, lastName, birthday, voiceType, email,
        createdAt: new Date().toISOString(),
      });
      router.push("/");
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "An account with this email already exists."
        : "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F2EC] flex flex-col items-center justify-center px-6 pb-10">

      {/* Logo */}
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

      <div className="w-full max-w-sm bg-white rounded-3xl border border-[rgba(44,95,63,0.1)] shadow-sm p-6">

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-[#2C5F3F]" : i < step ? "w-1.5 bg-[#5A7A65]" : "w-1.5 bg-[#D5E0D8]"
            }`} />
          ))}
          <span className="text-[10px] text-[#8FA896] ml-1">Step {step + 1} of 3</span>
        </div>

        {/* Step 0 — Personal info */}
        {step === 0 && (
          <div>
            <h2 className="text-[20px] text-[#1C2B22] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              About you
            </h2>
            <p className="text-[13px] text-[#8FA896] mb-5">Tell us a little about yourself.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Molly"
                    className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Date of birth</label>
                <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1C2B22] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
              </div>
            </div>
            <button onClick={goNext} disabled={!firstName || !lastName}
              className="w-full h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold mt-5 active:scale-[0.98] disabled:opacity-40">
              Next →
            </button>
          </div>
        )}

        {/* Step 1 — Voice type */}
        {step === 1 && (
          <div>
            <h2 className="text-[20px] text-[#1C2B22] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your voice
            </h2>
            <p className="text-[13px] text-[#8FA896] mb-5">What's your voice type?</p>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_TYPES.map((v) => (
                <button key={v} type="button" onClick={() => setVoiceType(v)}
                  className={`h-11 rounded-xl border text-[13px] font-medium transition-all active:scale-95 ${
                    voiceType === v
                      ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                      : "bg-[#F5F2EC] text-[#5A7A65] border-[rgba(44,95,63,0.15)] hover:bg-[#EAF0EB]"
                  }`}>
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setStep(0)}
                className="flex-1 h-11 rounded-full border border-[rgba(44,95,63,0.2)] text-[13px] font-medium text-[#5A7A65] hover:bg-[#F5F2EC]">
                ← Back
              </button>
              <button onClick={goNext} disabled={!voiceType}
                className="flex-1 h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] disabled:opacity-40">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Email + password */}
        {step === 2 && (
          <form onSubmit={handleRegister}>
            <h2 className="text-[20px] text-[#1C2B22] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create account
            </h2>
            <p className="text-[13px] text-[#8FA896] mb-5">Almost there.</p>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Confirm password</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[14px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-700 mt-3">
                {error}
              </div>
            )}
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 h-11 rounded-full border border-[rgba(44,95,63,0.2)] text-[13px] font-medium text-[#5A7A65] hover:bg-[#F5F2EC]">
                ← Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] disabled:opacity-60">
                {loading ? "Creating..." : "Create account →"}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="text-[13px] text-[#8FA896] mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2C5F3F] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}