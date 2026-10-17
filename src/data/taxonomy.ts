import type { Category, Material, Region } from "@/lib/types";

export const CATEGORIES: Category[] = [
  {
    slug: "ceramics",
    name: "Кераміка",
    description: "Чашки, тарілки, вази та інший посуд ручного ліплення",
    icon: "Coffee",
    image: "/demo/cat-ceramics.jpg",
  },
  {
    slug: "jewelry",
    name: "Прикраси",
    description: "Сережки, кулони, браслети зі срібла, латуні та каменів",
    icon: "Gem",
    image: "/demo/cat-jewelry.jpg",
  },
  {
    slug: "textile",
    name: "Текстиль",
    description: "Вишиванки, пледи, подушки, ткані та в'язані речі",
    icon: "Shirt",
    image: "/demo/cat-textile.jpg",
  },
  {
    slug: "wood",
    name: "Дерево",
    description: "Дошки, іграшки, меблі та дрібниці з натурального дерева",
    icon: "TreePine",
    image: "/demo/cat-wood.jpg",
  },
  {
    slug: "candles",
    name: "Свічки та аромати",
    description: "Соєві свічки, саше, аромадифузори ручної роботи",
    icon: "Flame",
    image: "/demo/cat-candles.jpg",
  },
  {
    slug: "art",
    name: "Ілюстрації",
    description: "Принти, акварелі, листівки та авторська графіка",
    icon: "Palette",
    image: "/demo/cat-art.jpg",
  },
  {
    slug: "leather",
    name: "Шкіра",
    description: "Гаманці, сумки, обкладинки з натуральної шкіри",
    icon: "Wallet",
    image: "/demo/cat-leather.jpg",
  },
  {
    slug: "home",
    name: "Для дому",
    description: "Декор, кошики, макраме та дрібниці для затишку",
    icon: "Home",
    image: "/demo/cat-home.jpg",
  },
];

export const MATERIALS: Material[] = [
  { slug: "clay", name: "Глина" },
  { slug: "porcelain", name: "Порцеляна" },
  { slug: "silver", name: "Срібло" },
  { slug: "brass", name: "Латунь" },
  { slug: "stone", name: "Натуральне каміння" },
  { slug: "glass", name: "Скло" },
  { slug: "linen", name: "Льон" },
  { slug: "cotton", name: "Бавовна" },
  { slug: "wool", name: "Вовна" },
  { slug: "oak", name: "Дуб" },
  { slug: "walnut", name: "Горіх" },
  { slug: "ash", name: "Ясен" },
  { slug: "soy-wax", name: "Соєвий віск" },
  { slug: "beeswax", name: "Бджолиний віск" },
  { slug: "paper", name: "Папір" },
  { slug: "leather", name: "Натуральна шкіра" },
  { slug: "jute", name: "Джут" },
  { slug: "wicker", name: "Лоза" },
];

export const REGIONS: Region[] = [
  { slug: "kyiv", name: "Київщина" },
  { slug: "lviv", name: "Львівщина" },
  { slug: "ivano-frankivsk", name: "Прикарпаття" },
  { slug: "zakarpattia", name: "Закарпаття" },
  { slug: "poltava", name: "Полтавщина" },
  { slug: "chernihiv", name: "Чернігівщина" },
  { slug: "odesa", name: "Одещина" },
  { slug: "kharkiv", name: "Харківщина" },
  { slug: "vinnytsia", name: "Вінниччина" },
  { slug: "dnipro", name: "Дніпровщина" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const materialBySlug = (slug: string) => MATERIALS.find((m) => m.slug === slug);
export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);
