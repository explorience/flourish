import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Potluck — Coordinate What You Need",
  description:
    "A lightweight coordination tool for shared events and gatherings. Create a potluck, share it, and let people claim what to bring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
