"use client";

import { useEffect } from "react";
import { registerSW, scheduleShowsReminder } from "@/lib/notifications";

export default function SWRegister() {
  useEffect(() => {
    registerSW();
    scheduleShowsReminder();
  }, []);

  return null;
}