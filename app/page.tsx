import RoutineCard from "@/components/dashboard/RoutineCard";
import TodayShowsCard from "@/components/dashboard/TodayShowsCard";
import CoolDownCard from "@/components/dashboard/CoolDownCard";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl">
      <div className="px-4 pt-2 pb-16 space-y-10">

        <section>
          <p className="text-[10px] font-black tracking-[3px] uppercase text-emerald-600 mb-3">
            🔥 Warmup
          </p>
          <div className="rounded-3xl bg-white dark:bg-emerald-950 shadow-sm border border-emerald-900/10 p-5 sm:p-6">
            <RoutineCard />
          </div>
        </section>

        <section>
          <p className="text-[10px] font-black tracking-[3px] uppercase text-emerald-600 mb-3">
            📅 Performance log
          </p>
          <div className="rounded-3xl bg-white dark:bg-emerald-950 shadow-sm border border-emerald-900/10 p-5 sm:p-6">
            <TodayShowsCard />
          </div>
        </section>

        <section>
          <p className="text-[10px] font-black tracking-[3px] uppercase text-emerald-600 mb-3">
            🌙 Cool down
          </p>
          <CoolDownCard />
        </section>

      </div>
    </main>
  );
}