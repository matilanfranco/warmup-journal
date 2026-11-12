"use client";

import { useEffect } from "react";
import { registerSW, refreshPush } from "@/lib/push";
import { useAuth } from "@/lib/AuthContext";

export default function SWRegister() {
  const { user } = useAuth();

  useEffect(() => { registerSW(); }, []);
  useEffect(() => { if (user) refreshPush(); }, [user]);

  return null;
}
