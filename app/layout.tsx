import type { Metadata } from "next";
import { Nunito, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ConditionalHeader } from "@/components/conditional-header";
import { UserProfileProvider } from "@/lib/user-profile-context";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
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
      <body className={`${nunito.variable} ${cormorantGaramond.variable} antialiased min-h-svh flex flex-col`}>
        <ConditionalHeader />
        <main className="flex flex-1 flex-col">
          <UserProfileProvider>{children}</UserProfileProvider>
        </main>
      </body>
    </html>
  );
}
