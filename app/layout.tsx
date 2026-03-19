import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, DM_Mono } from "next/font/google";
import "./globals.css";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { UserProfileProvider } from "@/lib/user-profile-context";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FlowMind",
  description: "Advanced mobile demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${instrumentSerif.variable} ${dmMono.variable} antialiased min-h-svh flex flex-col`}>
        <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b border-border px-4 py-3">
          <BreadcrumbNav />
        </header>
        <main className="flex flex-1 flex-col">
          <UserProfileProvider>{children}</UserProfileProvider>
        </main>
      </body>
    </html>
  );
}
