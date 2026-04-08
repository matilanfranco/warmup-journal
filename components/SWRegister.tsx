"use client";

import { useEffect } from "react";
import { registerSW, scheduleShowsReminder, scheduleDailyReminder } from "@/lib/notifications";

export default function SWRegister() {
  useEffect(() => {
    registerSW();
    scheduleShowsReminder();
    scheduleDailyReminder();
  }, []);

  return null;
}