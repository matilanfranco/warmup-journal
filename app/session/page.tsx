"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SessionRunner from "../../components/session/SessionRunner";

export default function SessionPage() {
  const searchParams = useSearchParams();

  const [routineId, setRoutineId] = useState("personal");

  useEffect(() => {
    const routineFromUrl = searchParams.get("routine");

    if (routineFromUrl) {
      setRoutineId(routineFromUrl);
      return;
    }

    const routineFromStorage = localStorage.getItem("selectedRoutineId");

    if (routineFromStorage) {
      setRoutineId(routineFromStorage);
      return;
    }

    setRoutineId("personal");
  }, [searchParams]);

  return (
    <main>
      <Link href="/" className="underline">
        ← Back to Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">Welcome to the warmup</h1>

      <p className="mt-2 text-sm opacity-70">
        Selected routine: <span className="opacity-90">{routineId}</span>
      </p>

      <SessionRunner routineId={routineId} />

      <div className="mt-6">
        <Link href="/warmups" className="underline">
          Change routine
        </Link>
      </div>
    </main>
  );
}