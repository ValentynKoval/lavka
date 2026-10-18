import { ImageResponse } from "next/og";
import { loadGoogleFont, OG_SIZE } from "@/lib/og/font";

export const alt = "Lavka — авторські вироби ручної роботи";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const title = "Речі, у яких залишилось тепло рук майстра";
  const subtitle = "Lavka — маркетплейс українських майстрів: кераміка, прикраси, текстиль, дерево, свічки";
  const font = await loadGoogleFont("Playfair Display", 600, title + "Lavka");
  const body = await loadGoogleFont("Manrope", 500, subtitle);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #fbf8f3 0%, #f6f0e6 60%, #f5dccf 100%)",
          color: "#2b2622",
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#c2633f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbf8f3", fontSize: 34, fontFamily: "Playfair" }}>L</div>
          <div style={{ fontSize: 40, fontFamily: "Playfair", fontWeight: 600 }}>Lavka</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, fontFamily: "Playfair", fontWeight: 600, maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 28, color: "#7a6f66", maxWidth: 980 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#7a6f66" }}>
          <span>lavka-green.vercel.app</span>
          <span>Зроблено руками в Україні</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(font ? [{ name: "Playfair", data: font, weight: 600 as const, style: "normal" as const }] : []),
        ...(body ? [{ name: "Manrope", data: body, weight: 500 as const, style: "normal" as const }] : []),
      ],
    },
  );
}
