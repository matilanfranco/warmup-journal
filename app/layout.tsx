import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "The Daily Singer",
  description: "Your daily voice routine journal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-[#DFF7E3] dark:bg-[#0d1a11] text-emerald-950 dark:text-emerald-50 overflow-x-hidden">
        <Header />
        <div className="mx-auto max-w-4xl px-2 py-6 sm:px-6">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}