import Link from "next/link";

export default function RoutineCard() {
  return (
    <section className="rounded-3xl border border-emerald-900/10 bg-white p-4 shadow-sm sm:p-6">
      {/* Top */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
              ☀️ Today
            </span>
            <span className="text-sm font-black tracking-tight text-emerald-950/90">
              Today’s routine
            </span>
          </div>

          <p className="mt-2 text-sm text-emerald-900/70">
            There is no warm-up routine yet.
          </p>
        </div>

        {/* Actions (stack in mobile) */}
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <Link
            href="/session"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
          >
            Start warmup
          </Link>

          <Link
            href="/warmups"
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-emerald-900/15 bg-emerald-50 px-5 text-sm font-extrabold text-emerald-900 hover:bg-emerald-100 active:scale-[0.99]"
          >
            Choose routine
          </Link>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {["Voice warm-up", "Breath", "Resonance"].map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900/80"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}