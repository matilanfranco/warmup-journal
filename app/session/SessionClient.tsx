"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SessionRunner from "@/components/session/SessionRunner";

export default function SessionClient() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routine") ?? "personal";

  const routineLabel =
    routineId === "personal" ? "Your routine" : routineId.replace(/-/g, " ");

  return (
    <main className="min-h-screen bg-[#DFF7E3] text-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-2">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-emerald-900/10 bg-white px-4 py-2 text-sm font-extrabold text-emerald-900 shadow-sm hover:bg-emerald-50"
          >
            ← Back to Dashboard
          </Link>

          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
            🎤 Session
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-black tracking-tight text-emerald-900">
          Welcome to today’s warmup
        </h1>

        <p className="mt-2 text-sm text-neutral-700">
          Selected routine:{" "}
          <span className="font-extrabold text-emerald-900">
            {routineLabel}
          </span>
        </p>

        {/* Runner Card */}
        <section className="mt-6 rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <SessionRunner routineId={routineId} />
        </section>

        {/* Small hint */}
        <p className="mt-4 text-xs text-neutral-600">
          Tip: keep it light and consistent — even 3 minutes counts.
        </p>
      </div>
    </main>
  );
}