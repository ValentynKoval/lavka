import { ImageResponse } from "next/og";
import { categoryBySlug } from "@/data/taxonomy";
import { loadGoogleFont, OG_SIZE } from "@/lib/og/font";
import { getCatalogRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";

export const alt = "Виріб на Lavka";
export const size = OG_SIZE;
export const contentType = "image/png";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavka-green.vercel.app";

export default async function ProductOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogRepository().getProductBySlug(slug);
  const title = product?.title ?? "Виріб ручної роботи";
  const shop = product?.shop?.name ?? "Lavka";
  const price = product ? formatPrice(product.price) : "";
  const category = product ? categoryBySlug(product.categorySlug)?.name ?? "" : "";
  const image = product?.images[0]?.url;
  const imageUrl = image ? (image.startsWith("http") ? image : `${SITE}${image}`) : null;
  const [display, body] = await Promise.all([
    loadGoogleFont("Playfair Display", 600, title + "Lavka"),
    loadGoogleFont("Manrope", 500, `${shop}${price}${category}Ручна роботаlavka-green.vercel.app`),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fbf8f3", color: "#2b2622", fontFamily: "Manrope" }}>
        <div style={{ width: 540, height: "100%", display: "flex", background: "#ece2d2" }}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" width={540} height={630} style={{ objectFit: "cover", width: 540, height: 630 }} />
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#c2633f", color: "#fbf8f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontFamily: "Playfair" }}>L</div>
            <span style={{ fontSize: 30, fontFamily: "Playfair", fontWeight: 600 }}>Lavka</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {category && <span style={{ fontSize: 20, color: "#c2633f", textTransform: "uppercase", letterSpacing: 3 }}>{category}</span>}
            <span style={{ fontSize: 52, lineHeight: 1.1, fontFamily: "Playfair", fontWeight: 600 }}>{title}</span>
            <span style={{ fontSize: 26, color: "#7a6f66" }}>{shop}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontSize: 44, fontWeight: 700 }}>{price}</span>
            <span style={{ fontSize: 20, color: "#7a6f66" }}>Ручна робота · lavka-green.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(display ? [{ name: "Playfair", data: display, weight: 600 as const, style: "normal" as const }] : []),
        ...(body ? [{ name: "Manrope", data: body, weight: 500 as const, style: "normal" as const }] : []),
      ],
    },
  );
}
