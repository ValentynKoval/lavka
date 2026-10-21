import { describe, expect, it } from "vitest";
import { REGIONS } from "./taxonomy";
import { MAP_VIEWBOX, outlinePath, project, REGION_POINTS, UKRAINE_OUTLINE } from "./ukraine-map";

describe("ukraine map", () => {
  it("projects every outline vertex inside the viewBox", () => {
    for (const [lon, lat] of UKRAINE_OUTLINE) {
      const { x, y } = project(lon, lat);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(MAP_VIEWBOX.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(MAP_VIEWBOX.height);
    }
  });
  it("keeps west to the left and north to the top", () => {
    const lviv = project(REGION_POINTS.lviv.lon, REGION_POINTS.lviv.lat);
    const kharkiv = project(REGION_POINTS.kharkiv.lon, REGION_POINTS.kharkiv.lat);
    const odesa = project(REGION_POINTS.odesa.lon, REGION_POINTS.odesa.lat);
    expect(lviv.x).toBeLessThan(kharkiv.x);
    expect(odesa.y).toBeGreaterThan(kharkiv.y);
  });
  it("has an anchor for every taxonomy region", () => {
    for (const region of REGIONS) expect(REGION_POINTS[region.slug]).toBeDefined();
  });
  it("builds a closed smooth path", () => {
    const d = outlinePath();
    expect(d.startsWith("M ")).toBe(true);
    expect(d.endsWith(" Z")).toBe(true);
    expect(d.match(/ C /g)?.length).toBe(UKRAINE_OUTLINE.length);
  });
});
