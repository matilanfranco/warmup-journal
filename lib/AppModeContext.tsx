"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AppMode, AppModeData, getAppMode } from "@/lib/firebaseService";
import { useAuth } from "@/lib/AuthContext";

type AppModeContextType = {
  mode: AppMode;
  modeData: AppModeData | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppModeContext = createContext<AppModeContextType>({
  mode: "contract",
  modeData: null,
  loading: true,
  refresh: async () => {},
});

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<AppMode>("contract");
  const [modeData, setModeData] = useState<AppModeData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    try {
      const data = await getAppMode();
      if (data) {
        setMode(data.current);
        setModeData(data);
      } else {
        setMode("contract");
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) refresh();
    else setLoading(false);
  }, [user]);

  return (
    <AppModeContext.Provider value={{ mode, modeData, loading, refresh }}>
      {children}
    </AppModeContext.Provider>
  );
}

export const useAppMode = () => useContext(AppModeContext);