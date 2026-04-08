"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import Image from "next/image";
import { requestPermission, hasPermission } from "@/lib/notifications";

const VOICE_TYPES = ["Soprano", "Mezzo-soprano", "Contralto", "Tenor", "Baritone", "Bass"];

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [voiceType, setVoiceType] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const [pwSection, setPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"unknown" | "granted" | "denied">("unknown");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifStatus(Notification.permission as any);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setBirthday(profile.birthday ?? "");
      setVoiceType(profile.voiceType ?? "");
    }
  }, [profile]);

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "M";

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setSavedOk(false);
    try {
      await updateDoc(doc(db, "users", user.uid), { firstName, lastName, birthday, voiceType });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    if (newPw.length < 6) { setPwError("Min. 6 characters."); return; }
    setPwError(""); setPwSaving(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setPwOk(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setPwOk(false); setPwSection(false); }, 2000);
    } catch (e: any) {
      setPwError(e.code === "auth/wrong-password" ? "Current password is incorrect." : "Something went wrong.");
    } finally { setPwSaving(false); }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    setNotifStatus(granted ? "granted" : "denied");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const formatBirthday = (b: string) => {
    if (!b) return null;
    const [y, m, d] = b.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(new Date(y, m - 1, d));
  };

  return (
    <main className="min-h-screen bg-[#F5F2EC]">
      <div className="mx-auto max-w-md px-4 pt-4 pb-28">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] text-[#1C2B22] leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}>
            Profile
          </h1>
          <p className="text-[13px] text-[#8FA896]">Your account and preferences.</p>
        </div>

        {/* Avatar + name */}
        <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF0EB] border border-[rgba(44,95,63,0.15)] flex items-center justify-center shrink-0">
              <span className="text-[22px] font-bold text-[#2C5F3F]">{initials}</span>
            </div>
            <div>
              <p className="text-[18px] font-semibold text-[#1C2B22]">
                {firstName} {lastName}
              </p>
              <p className="text-[12px] text-[#8FA896]">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {voiceType && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EAF0EB] text-[#2C5F3F] border border-[rgba(44,95,63,0.15)]">
                    {voiceType}
                  </span>
                )}
                {birthday && (
                  <span className="text-[11px] text-[#8FA896]">🎂 {formatBirthday(birthday)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5 mb-4">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-4">Personal info</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">First name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Last name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Date of birth</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)}
                className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">Voice type</label>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_TYPES.map((v) => (
                  <button key={v} type="button" onClick={() => setVoiceType(v)}
                    className={`h-10 rounded-xl border text-[12px] font-medium transition-all active:scale-95 ${
                      voiceType === v
                        ? "bg-[#2C5F3F] text-white border-[#2C5F3F]"
                        : "bg-[#F5F2EC] text-[#5A7A65] border-[rgba(44,95,63,0.15)] hover:bg-[#EAF0EB]"
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className={`w-full h-11 rounded-full mt-5 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60 ${
              savedOk ? "bg-[#EAF0EB] text-[#2C5F3F] border border-[rgba(44,95,63,0.2)]" : "bg-[#2C5F3F] text-white"
            }`}>
            {savedOk ? "✓ Saved!" : saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5 mb-4">
          <button onClick={() => setPwSection((v) => !v)}
            className="w-full flex items-center justify-between">
            <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896]">Change password</p>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`text-[#B5C4B9] transition-transform ${pwSection ? "rotate-180" : ""}`}>
              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {pwSection && (
            <div className="mt-4 space-y-3">
              {[
                { label: "Current password", value: currentPw, set: setCurrentPw },
                { label: "New password", value: newPw, set: setNewPw },
                { label: "Confirm new password", value: confirmPw, set: setConfirmPw },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="text-[11px] font-semibold text-[#5A7A65] uppercase tracking-wide block mb-1.5">{label}</label>
                  <input type="password" value={value} onChange={(e) => set(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F5F2EC] border border-[rgba(44,95,63,0.15)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#1C2B22] placeholder:text-[#B5C4B9] focus:outline-none focus:ring-2 focus:ring-[rgba(44,95,63,0.2)]" />
                </div>
              ))}
              {pwError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-700">{pwError}</div>
              )}
              <button onClick={handleChangePassword} disabled={pwSaving || pwOk}
                className={`w-full h-11 rounded-full text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-60 ${
                  pwOk ? "bg-[#EAF0EB] text-[#2C5F3F] border border-[rgba(44,95,63,0.2)]" : "bg-[#2C5F3F] text-white"
                }`}>
                {pwOk ? "✓ Password updated!" : pwSaving ? "Updating..." : "Update password"}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl border border-[rgba(44,95,63,0.08)] shadow-sm p-5 mb-4">
          <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3">Reminders</p>
          {notifStatus === "granted" ? (
            <div className="flex items-center gap-3 h-11 rounded-full bg-[#EAF0EB] border border-[rgba(44,95,63,0.15)] px-5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L6 12L14 4" stroke="#2C5F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[13px] font-semibold text-[#2C5F3F]">Notifications enabled</span>
            </div>
          ) : notifStatus === "denied" ? (
            <div>
              <div className="flex items-center gap-3 h-11 rounded-full bg-rose-50 border border-rose-200 px-5 mb-2">
                <span className="text-[13px] font-semibold text-rose-600">Notifications blocked</span>
              </div>
              <p className="text-[11px] text-[#8FA896] text-center">
                Go to iPhone Settings → The Daily Singer → Notifications to enable them.
              </p>
            </div>
          ) : (
            <div>
              <button onClick={handleEnableNotifications}
                className="w-full h-11 rounded-full bg-[#2C5F3F] text-white text-[13px] font-semibold active:scale-[0.98] transition-transform mb-2">
                🔔 Enable reminders
              </button>
              <p className="text-[11px] text-[#8FA896] text-center leading-relaxed">
                Get reminders to finish your warmup, log your shows, and check in on rest days.
              </p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut}
          className="w-full h-11 rounded-full border border-rose-200 text-[13px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors active:scale-[0.98]">
          Sign out
        </button>

      </div>
    </main>
  );
}