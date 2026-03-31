import HeroCard from "@/components/dashboard/HeroCard";
import TodayShowsCard from "@/components/dashboard/TodayShowsCard";
import CoolDownCard from "@/components/dashboard/CoolDownCard";
import InsightsCard from "@/components/dashboard/InsightsCard";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-5 py-3 pb-8">
      <HeroCard />
      <TodayShowsCard />
      <CoolDownCard />
      <InsightsCard />
    </main>
  );
}