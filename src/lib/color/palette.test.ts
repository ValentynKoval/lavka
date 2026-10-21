import { describe, expect, it } from "vitest";
import { colorDistance, colorTag, hexToHsl, paletteDistance, paletteTags, rgbToHex } from "./palette";

describe("hexToHsl", () => {
  it("converts primaries", () => {
    expect(hexToHsl("#ff0000")).toEqual({ h: 0, s: 1, l: 0.5 });
    expect(hexToHsl("#00ff00").h).toBe(120);
    expect(hexToHsl("#0000ff").h).toBe(240);
  });
  it("round-trips through rgbToHex", () => {
    expect(rgbToHex(194, 99, 63)).toBe("#c2633f");
  });
});

describe("colorTag", () => {
  it("names the brand palette the way a person would", () => {
    expect(colorTag("#fbf8f3")).toBe("white"); // linen
    expect(colorTag("#2b2622")).toBe("black"); // ink
    expect(colorTag("#c2633f")).toBe("terracotta"); // clay
    expect(colorTag("#6b7a4b")).toBe("green"); // moss
    expect(colorTag("#d9a441")).toBe("yellow"); // sand
    expect(colorTag("#dccdb6")).toBe("beige");
    expect(colorTag("#6e4b33")).toBe("brown");
    expect(colorTag("#3f5f8f")).toBe("blue");
    expect(colorTag("#8f8a84")).toBe("gray");
  });
  it("treats pale desaturated pinks as pink and dark saturated reds as red", () => {
    expect(colorTag("#e8b4c0")).toBe("pink");
    expect(colorTag("#8f1f1a")).toBe("red");
  });
});

describe("paletteTags", () => {
  it("deduplicates tags and skips garbage", () => {
    expect(paletteTags(["#fbf8f3", "#f6f0e6", "#c2633f", "nope"])).toEqual(["white", "terracotta"]);
  });
});

describe("distances", () => {
  it("is zero for identical colours and grows with difference", () => {
    expect(colorDistance("#c2633f", "#c2633f")).toBe(0);
    expect(colorDistance("#c2633f", "#d08560")).toBeLessThan(colorDistance("#c2633f", "#3f5f8f"));
  });
  it("ranks a similar palette closer than a contrasting one", () => {
    const base = ["#f4efe6", "#c2633f"];
    expect(paletteDistance(base, ["#f6f0e6", "#a84f2f"])).toBeLessThan(paletteDistance(base, ["#2b2622", "#3f5f8f"]));
    expect(paletteDistance(base, [])).toBe(1);
  });
});
