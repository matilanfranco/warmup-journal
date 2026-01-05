import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="font-bold">
          Warm-Up Journal
        </Link>

        <div className="flex gap-4">
          <Link href="/" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/warmups" className="hover:underline">
            Warmups
          </Link>
          <Link href="/history" className="hover:underline">
            History
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}