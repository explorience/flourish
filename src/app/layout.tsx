import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.potluck.exchange";

export const metadata: Metadata = {
  title: {
    default: "Potluck — Coordinate What You Need",
    template: "%s — Potluck",
  },
  description:
    "A lightweight coordination tool for shared events and gatherings. Create a potluck, share it, and let people claim what to bring.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Potluck",
    title: "Potluck — Coordinate What You Need",
    description:
      "What do we need? Who's bringing what? Create a potluck, share it with your people, and let everyone claim what to bring.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Potluck — Coordinate What You Need",
    description:
      "What do we need? Who's bringing what? Simple, beautiful coordination for shared events.",
  },
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
        <Toaster position="bottom-center" richColors toastOptions={{ className: "sm:ml-auto sm:mr-0" }} />
      </body>
    </html>
  );
}
