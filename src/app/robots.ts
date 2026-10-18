import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavka-green.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/seller", "/admin", "/cart", "/checkout", "/orders", "/messages", "/favorites", "/login", "/register"] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
