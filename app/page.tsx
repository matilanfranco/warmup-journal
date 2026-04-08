import HeroCard from "@/components/dashboard/HeroCard";
import TodayShowsCard from "@/components/dashboard/TodayShowsCard";
import CoolDownCard from "@/components/dashboard/CoolDownCard";
import RestDayCard from "@/components/dashboard/RestDayCard";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-5 py-3 pb-8">
      <HeroCard />
      <TodayShowsCard />
      <CoolDownCard />
      <RestDayCard />
    </main>
  );
}