import Link from "next/link";

export default function RoutineCard() {
  return (
    <section className="rounded-2xl border p-5">
      <h2 className="text-xl font-semibold">☀️ Today's routine</h2>
      <p className="mt-2 text-sm text-gray-600">
        There is no warm-up routine yet.
      </p>
      <Link href="/session" className="...">
        Start warmup
      </Link>
    </section>
  );
}