"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SessionRunner from "@/components/session/SessionRunner";

export default function SessionClient() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routine") ?? "personal";

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
    </main>
  );
}