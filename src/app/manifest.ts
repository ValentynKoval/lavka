import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lavka — авторські вироби ручної роботи",
    short_name: "Lavka",
    description: "Маркетплейс українських майстрів: кераміка, прикраси, текстиль, дерево, свічки, ілюстрації.",
    start_url: "/",
    display: "standalone",
    lang: "uk",
    background_color: "#fbf8f3",
    theme_color: "#c2633f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
