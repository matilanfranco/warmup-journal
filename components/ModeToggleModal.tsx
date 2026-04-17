"use client";

import { useState } from "react";
import { setAppMode, AppMode, AppModeData } from "@/lib/firebaseService";
import { useAppMode } from "@/lib/AppModeContext";
import { getAppDate } from "@/lib/dateUtils";

type Props = {
  onClose: () => void;
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(y, m - 1, day));
}

export default function ModeToggleModal({ onClose }: Props) {
  const { mode, modeData, refresh } = useAppMode();
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const targetMode: AppMode = mode === "contract" ? "break" : "contract";
  const isClosingContract = mode === "contract";

  const startDate = modeData?.currentStartDate ?? getAppDate();
  const today = getAppDate();
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const days = Math.floor((new Date(ty, tm - 1, td).getTime() - new Date(sy, sm - 1, sd).getTime()) / (1000 * 60 * 60 * 24));

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await setAppMode(targetMode, modeData);
      await refresh();
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">

        {isClosingContract ? (
          <>
            {/* Closing a contract */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] flex items-center justify-center text-2xl mx-auto mb-3">
                🌴
              </div>
              <h2 className="text-[20px] text-[#1C2B22] mb-1"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                Closing this chapter
              </h2>
              <p className="text-[13px] text-[#8FA896] leading-relaxed">
                You're about to close your current contract in your journal and enter Break Mode.
              </p>
            </div>

            {/* Contract summary */}
            <div className="bg-[#F9F8F5] rounded-2xl p-4 border border-[rgba(44,95,63,0.08)] mb-5">
              <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3">
                This contract
              </p>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-[#5A7A65]">Started</span>
                <span className="text-[12px] font-semibold text-[#1C2B22]">{formatDate(startDate)}</span>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-[#5A7A65]">Closing</span>
                <span className="text-[12px] font-semibold text-[#1C2B22]">{formatDate(today)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[rgba(44,95,63,0.07)] mt-2">
                <span className="text-[12px] text-[#5A7A65]">Duration</span>
                <span className="text-[14px] font-bold text-[#2C5F3F]">{days} day{days !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <p className="text-[12px] text-[#8FA896] text-center mb-5 leading-relaxed">
              In Break Mode the app is more relaxed — no pressure, just light daily check-ins. You can switch back anytime.
            </p>
          </>
        ) : (
          <>
            {/* Returning to contract */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF0EB] flex items-center justify-center text-2xl mx-auto mb-3">
                🎤
              </div>
              <h2 className="text-[20px] text-[#1C2B22] mb-1"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
                Starting a new contract
              </h2>
              <p className="text-[13px] text-[#8FA896] leading-relaxed">
                Your break period will be closed and a new contract chapter starts today.
              </p>
            </div>

            <div className="bg-[#F9F8F5] rounded-2xl p-4 border border-[rgba(44,95,63,0.08)] mb-5">
              <p className="text-[10px] font-black tracking-widest uppercase text-[#8FA896] mb-3">Break period</p>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[12px] text-[#5A7A65]">Started</span>
                <span className="text-[12px] font-semibold text-[#1C2B22]">{formatDate(startDate)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[rgba(44,95,63,0.07)] mt-2">
                <span className="text-[12px] text-[#5A7A65]">Duration</span>
                <span className="text-[14px] font-bold text-[#D97706]">{days} day{days !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 h-11 rounded-full border border-[rgba(44,95,63,0.15)] text-[13px] font-medium text-[#8FA896] hover:bg-[#F5F2EC] transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={saving}
            className={`flex-1 h-11 rounded-full text-[13px] font-semibold active:scale-[0.98] disabled:opacity-60 transition-all text-white ${
              isClosingContract ? "bg-[#D97706]" : "bg-[#2C5F3F]"
            }`}>
            {saving ? "Saving..." : isClosingContract ? "Enter Break Mode 🌴" : "Start Contract 🎤"}
          </button>
        </div>
      </div>
    </div>
  );
}