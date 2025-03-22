import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import { cn } from "@/utils/helpers/cn.helper";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "@/components/layout/header";
import { getTheme } from "@/cookies/get";
import { Providers } from "@/providers";


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  adjustFontFallback: false,
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: "Big Calendar",
  description:
    "A feature-rich calendar application built with Next.js, TypeScript, and Tailwind CSS. This project provides a modern, responsive interface for managing events and schedules with multiple viewing options.",
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();

  return (
    <html lang="en-US" className={cn(geistSans.variable, geistMono.variable, "bg-bg-primary text-t-primary", theme)}>
      <body className="font-sans antialiased">
        <Providers>
        <Header />
        <Analytics />
        {children}
        </Providers>
      </body>
    </html>
  );
}
