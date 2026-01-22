import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#DFF7E3] text-neutral-900 overflow-x-hidden">
        <Header />
       <div className="mx-auto max-w-4xl px-2 py-6 sm:px-6">
        {children}
      </div>
        <Footer />
      </body>
    </html>
  );
}