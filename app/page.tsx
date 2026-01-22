import RoutineCard from "@/components/dashboard/RoutineCard";
import TodayShowsCard from "@/components/dashboard/TodayShowsCard";
import QuickCheckCard from "@/components/dashboard/QuickCheckCard";

export default function HomePage() {
  return (
  <main className="mx-auto max-w-3xl space-y-6">
    <div className="mx-auto max-w-3xl px-4 py-2">
      {/* Header */}
      <h1 className="text-3xl font-black tracking-tight text-emerald-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-neutral-700">Today’s overview</p>

      {/* Sections */}
      <div className="mt-10 space-y-10">

        {/* Warmup */}
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-emerald-900">
            🔥 Warmup
          </h2>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-emerald-900/10">
            <RoutineCard />
          </div>
        </section>

        {/* Schedule */}
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-emerald-900">
            📅 Schedule
          </h2>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-emerald-900/10">
            <TodayShowsCard />
          </div>
        </section>

        {/* Post show */}
        <section>
          <h2 className="mb-3 text-lg font-extrabold text-emerald-900">
            📝 Post-show
          </h2>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-emerald-900/10">
            <QuickCheckCard />
          </div>
        </section>

      </div>

    </div>
  </main>
);
}