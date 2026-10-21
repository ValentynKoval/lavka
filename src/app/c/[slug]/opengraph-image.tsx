import { ImageResponse } from "next/og";
import { getCollectionsRepository } from "@/lib/repositories";
import { loadGoogleFont, OG_SIZE } from "@/lib/og/font";

export const alt = "Lavka — колекція";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Social card for a public collection: title, owner and up to four product photos. */
export default async function CollectionOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionsRepository().getBySlug(slug, null);
  const title = collection?.title ?? "Колекція";
  const owner = collection?.owner?.fullName ? `Зібрав(ла) ${collection.owner.fullName}` : "Lavka";
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const previews = (collection?.previews ?? []).slice(0, 4).map((u) => (u.startsWith("http") ? u : `${base}${u}`));
  const [display, body] = await Promise.all([loadGoogleFont("Playfair Display", 600, title + "Lavka"), loadGoogleFont("Manrope", 500, owner + "колекція виробів ручної роботи")]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fbf8f3", color: "#2b2622", fontFamily: "Manrope" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#c2633f", color: "#fbf8f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontFamily: "Playfair" }}>L</div>
            <div style={{ fontSize: 34, fontFamily: "Playfair", fontWeight: 600 }}>Lavka</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 24, color: "#c2633f", textTransform: "uppercase", letterSpacing: 4 }}>Колекція</div>
            <div style={{ fontSize: 60, lineHeight: 1.05, fontFamily: "Playfair", fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 26, color: "#7a6f66" }}>{owner}</div>
          </div>
          <div style={{ fontSize: 22, color: "#7a6f66" }}>Вироби ручної роботи від українських майстрів</div>
        </div>
        <div style={{ width: 460, display: "flex", flexWrap: "wrap", padding: 32, gap: 16, alignContent: "center" }}>
          {previews.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            previews.map((u, i) => <img key={i} src={u} alt="" width={190} height={190} style={{ width: 190, height: 190, objectFit: "cover", borderRadius: 24 }} />)
          ) : (
            <div style={{ width: 396, height: 396, borderRadius: 32, background: "#ece2d2" }} />
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(display ? [{ name: "Playfair", data: display, style: "normal" as const, weight: 600 as const }] : []),
        ...(body ? [{ name: "Manrope", data: body, style: "normal" as const, weight: 500 as const }] : []),
      ],
    },
  );
}
