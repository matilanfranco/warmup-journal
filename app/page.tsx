import RoutineCard from "@/components/dashboard/RoutineCard";
import TodayShowsCard from "@/components/dashboard/TodayShowsCard";
import QuickCheckCard from "@/components/dashboard/QuickCheckCard";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Today’s overview
          </p>

          <div className="mt-8 space-y-8">
            <section>
              <h2 className="mb-2 text-lg font-semibold">
                🔥 Warmup
              </h2>
              <RoutineCard />
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold">
                📅 Schedule
              </h2>
              <TodayShowsCard />
            </section>

            <section>
              <h2 className="mb-2 text-lg font-semibold">
                📝 Post-show
              </h2>
              <QuickCheckCard />
            </section>
          </div>
    </main>
  );
}