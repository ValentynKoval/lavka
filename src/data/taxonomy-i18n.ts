import type { Locale } from "@/i18n/config";
import type { Category, Material, Region } from "@/lib/types";
import { CATEGORIES, MATERIALS, REGIONS } from "./taxonomy";

type Named = { name: string; description?: string };

const CATEGORY_I18N: Record<Exclude<Locale, "uk">, Record<string, Named>> = {
  en: {
    ceramics: { name: "Ceramics", description: "Mugs, plates, vases and other hand-built tableware" },
    jewelry: { name: "Jewelry", description: "Earrings, pendants and bracelets in silver, brass and stone" },
    textile: { name: "Textiles", description: "Embroidery, blankets, cushions, woven and knitted goods" },
    wood: { name: "Wood", description: "Boards, toys, furniture and small things in natural wood" },
    candles: { name: "Candles & scents", description: "Soy candles, sachets and hand-poured diffusers" },
    art: { name: "Art", description: "Prints, watercolours, postcards and original graphics" },
    leather: { name: "Leather", description: "Wallets, bags and covers in natural leather" },
    home: { name: "Home", description: "Decor, baskets, macramé and little things for coziness" },
  },
  ru: {
    ceramics: { name: "Керамика", description: "Чашки, тарелки, вазы и другая посуда ручной лепки" },
    jewelry: { name: "Украшения", description: "Серьги, кулоны, браслеты из серебра, латуни и камней" },
    textile: { name: "Текстиль", description: "Вышиванки, пледы, подушки, тканые и вязаные вещи" },
    wood: { name: "Дерево", description: "Доски, игрушки, мебель и мелочи из натурального дерева" },
    candles: { name: "Свечи и ароматы", description: "Соевые свечи, саше, аромадиффузоры ручной работы" },
    art: { name: "Иллюстрации", description: "Принты, акварели, открытки и авторская графика" },
    leather: { name: "Кожа", description: "Кошельки, сумки, обложки из натуральной кожи" },
    home: { name: "Для дома", description: "Декор, корзины, макраме и мелочи для уюта" },
  },
};

const MATERIAL_I18N: Record<Exclude<Locale, "uk">, Record<string, string>> = {
  en: {
    clay: "Clay", porcelain: "Porcelain", silver: "Silver", brass: "Brass", stone: "Natural stone", glass: "Glass",
    linen: "Linen", cotton: "Cotton", wool: "Wool", oak: "Oak", walnut: "Walnut", ash: "Ash", "soy-wax": "Soy wax",
    beeswax: "Beeswax", paper: "Paper", leather: "Natural leather", jute: "Jute", wicker: "Wicker",
  },
  ru: {
    clay: "Глина", porcelain: "Фарфор", silver: "Серебро", brass: "Латунь", stone: "Натуральный камень", glass: "Стекло",
    linen: "Лён", cotton: "Хлопок", wool: "Шерсть", oak: "Дуб", walnut: "Орех", ash: "Ясень", "soy-wax": "Соевый воск",
    beeswax: "Пчелиный воск", paper: "Бумага", leather: "Натуральная кожа", jute: "Джут", wicker: "Лоза",
  },
};

const REGION_I18N: Record<Exclude<Locale, "uk">, Record<string, string>> = {
  en: {
    kyiv: "Kyiv region", lviv: "Lviv region", "ivano-frankivsk": "Carpathians", zakarpattia: "Zakarpattia", poltava: "Poltava region",
    chernihiv: "Chernihiv region", odesa: "Odesa region", kharkiv: "Kharkiv region", vinnytsia: "Vinnytsia region", dnipro: "Dnipro region",
  },
  ru: {
    kyiv: "Киевщина", lviv: "Львовщина", "ivano-frankivsk": "Прикарпатье", zakarpattia: "Закарпатье", poltava: "Полтавщина",
    chernihiv: "Черниговщина", odesa: "Одесчина", kharkiv: "Харьковщина", vinnytsia: "Винничина", dnipro: "Днепровщина",
  },
};

export interface LocalizedTaxonomy {
  categories: Category[];
  materials: Material[];
  regions: Region[];
  categoryBySlug: (slug: string) => Category | undefined;
  materialBySlug: (slug: string) => Material | undefined;
  regionBySlug: (slug: string) => Region | undefined;
  categoryName: (slug: string) => string;
  materialName: (slug: string) => string;
  regionName: (slug: string) => string;
}

const cache = new Map<Locale, LocalizedTaxonomy>();

/** Categories, materials and regions with names in the given language (Ukrainian is the source). */
export function getTaxonomy(locale: Locale): LocalizedTaxonomy {
  const cached = cache.get(locale);
  if (cached) return cached;

  const categories: Category[] =
    locale === "uk"
      ? CATEGORIES
      : CATEGORIES.map((c) => ({ ...c, name: CATEGORY_I18N[locale][c.slug]?.name ?? c.name, description: CATEGORY_I18N[locale][c.slug]?.description ?? c.description }));
  const materials: Material[] = locale === "uk" ? MATERIALS : MATERIALS.map((m) => ({ ...m, name: MATERIAL_I18N[locale][m.slug] ?? m.name }));
  const regions: Region[] = locale === "uk" ? REGIONS : REGIONS.map((r) => ({ ...r, name: REGION_I18N[locale][r.slug] ?? r.name }));

  const taxonomy: LocalizedTaxonomy = {
    categories,
    materials,
    regions,
    categoryBySlug: (slug) => categories.find((c) => c.slug === slug),
    materialBySlug: (slug) => materials.find((m) => m.slug === slug),
    regionBySlug: (slug) => regions.find((r) => r.slug === slug),
    categoryName: (slug) => categories.find((c) => c.slug === slug)?.name ?? slug,
    materialName: (slug) => materials.find((m) => m.slug === slug)?.name ?? slug,
    regionName: (slug) => regions.find((r) => r.slug === slug)?.name ?? slug,
  };
  cache.set(locale, taxonomy);
  return taxonomy;
}
