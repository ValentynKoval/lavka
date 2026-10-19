import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUser } from "@/lib/auth/session";
import { getChatRepository, isDemoMode } from "@/lib/repositories";
import { WebsiteJsonLd } from "@/components/seo/json-ld";
import { CommandPalette } from "@/components/layout/command-palette";
import { THEME_BOOTSTRAP_SCRIPT } from "@/components/layout/theme-toggle";
import { I18nProvider } from "@/i18n/client";
import { OG_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { getLocale, getTranslator } from "@/i18n/server";

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

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  return {
    title: { default: t("meta.siteTitle"), template: "%s · Lavka" },
    description: t("meta.siteDescription"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
      locale: OG_LOCALE[locale],
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const unread = user ? await getChatRepository().unreadCount(user.id).catch(() => 0) : 0;
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning className={`${manrope.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale} messages={getMessages(locale)}>
          <Suspense fallback={<div className="h-16 lg:h-[72px]" />}>
            <Header user={user} demo={isDemoMode()} unread={unread} />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <CommandPalette />
        </I18nProvider>
        <WebsiteJsonLd />
      </body>
    </html>
  );
}
