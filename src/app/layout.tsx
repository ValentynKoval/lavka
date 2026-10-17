import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/repositories";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lavka — маркетплейс авторських виробів ручної роботи",
    template: "%s · Lavka",
  },
  description:
    "Lavka — маркетплейс, де українські майстри продають кераміку, прикраси, текстиль, вироби з дерева та шкіри, свічки й ілюстрації ручної роботи.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Lavka — авторські вироби ручної роботи",
    description: "Речі з душею від українських майстрів.",
    locale: "uk_UA",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={`${manrope.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<div className="h-16 lg:h-[72px]" />}>
          <Header user={user} demo={isDemoMode()} />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
