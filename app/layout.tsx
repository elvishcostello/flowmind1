import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      <body className={`${geistSans.variable} antialiased min-h-svh flex flex-col`}>
        <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b border-border px-4 py-3">
          <BreadcrumbNav />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
