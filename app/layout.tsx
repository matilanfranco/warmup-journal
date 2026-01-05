import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Warm-Up Journal",
  description: "A simple journaling app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl p-6">{children}</div>
        <Footer />
      </body>
    </html>
  );
}