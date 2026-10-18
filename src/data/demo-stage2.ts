import type { Conversation, DailyPoint, Message, Order, OrderStatus, PromoCode, Review } from "@/lib/types";
import { DEMO_PRODUCTS, DEMO_SHOPS, DEMO_USERS } from "./demo";

/**
 * Deterministic stage-2 demo data (reviews, views, orders, chat) derived from the
 * base dataset with a seeded PRNG, so demo mode and the Supabase seed stay identical.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261017);
const pick = <T>(list: T[]): T => list[Math.floor(rand() * list.length)];
const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

export const BASE_DAY = new Date("2026-10-17T12:00:00.000Z");

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number, hour = 10): Date {
  const d = new Date(BASE_DAY.getTime() - days * 86_400_000);
  d.setUTCHours(hour, between(0, 59), 0, 0);
  return d;
}

export const DEMO_PROMO_CODES: PromoCode[] = [
  { code: "LAVKA10", percent: 10, active: true, expiresAt: null },
  { code: "HANDMADE15", percent: 15, active: true, expiresAt: null },
  { code: "WELCOME5", percent: 5, active: true, expiresAt: null },
];

const buyers = DEMO_USERS.filter((u) => u.role === "buyer");
const userName = (id: string) => DEMO_USERS.find((u) => u.id === id)?.fullName ?? "Покупець";

const REVIEW_TEXTS: Record<number, string[]> = {
  5: [
    "Неймовірна річ! Виглядає навіть краще, ніж на фото. Пакування — окреме задоволення.",
    "Замовляла в подарунок, людина була в захваті. Майстер відповідав на всі питання швидко.",
    "Якість на найвищому рівні, видно, що зроблено з любов'ю. Буду замовляти ще.",
    "Приїхало за два дні, все ціле. Відчувається ручна робота в кожній деталі.",
    "Користуюся щодня вже місяць — жодних нарікань. Рекомендую всім друзям.",
  ],
  4: [
    "Дуже гарно, але колір трохи відрізняється від фото — тепліший. Загалом задоволена.",
    "Якісна робота. Зняла одну зірку за довге очікування відправки, але воно того варте.",
    "Гарний виріб, приємний на дотик. Хотілося б трохи більший розмір.",
    "Все сподобалось, пакування могло б бути міцнішим, але товар не постраждав.",
  ],
  3: [
    "Нормально за свої гроші. Є дрібні нерівності, але це ж ручна робота.",
    "Очікувала трохи іншого відтінку. Майстер запропонував обмін — це плюс.",
  ],
};

export const DEMO_REVIEWS: Review[] = (() => {
  const list: Review[] = [];
  for (const product of DEMO_PRODUCTS) {
    const count = product.isFeatured ? between(2, 4) : between(0, 3);
    const shuffled = [...buyers].sort(() => rand() - 0.5).slice(0, count);
    shuffled.forEach((buyer, i) => {
      const rating = rand() < 0.65 ? 5 : rand() < 0.75 ? 4 : 3;
      list.push({
        id: `rev-${product.id}-${i}`,
        productId: product.id,
        userId: buyer.id,
        authorName: buyer.fullName,
        rating,
        text: pick(REVIEW_TEXTS[rating]),
        createdAt: daysAgo(between(1, 40), between(8, 21)).toISOString(),
      });
    });
  }
  return list;
})();

/** Daily view counters for the last 35 days, keyed by product id. */
export const DEMO_VIEWS: { productId: string; day: string; views: number }[] = (() => {
  const out: { productId: string; day: string; views: number }[] = [];
  for (const product of DEMO_PRODUCTS) {
    const base = product.isFeatured ? 14 : 5;
    for (let d = 34; d >= 0; d--) {
      const weekend = daysAgo(d).getUTCDay() % 6 === 0 ? 1.4 : 1;
      const views = Math.max(0, Math.round((base + between(-3, 6)) * weekend * (1 + (34 - d) / 60)));
      if (views > 0) out.push({ productId: product.id, day: dayKey(daysAgo(d)), views });
    }
  }
  return out;
})();

const CITIES = ["Київ", "Львів", "Харків", "Одеса", "Дніпро", "Вінниця", "Чернігів", "Полтава"];
const STATUS_BY_AGE = (age: number): OrderStatus =>
  age > 20 ? "delivered" : age > 10 ? (rand() < 0.8 ? "delivered" : "shipped") : age > 4 ? (rand() < 0.5 ? "shipped" : "confirmed") : rand() < 0.2 ? "cancelled" : "new";

export const DEMO_ORDERS: Order[] = (() => {
  const orders: Order[] = [];
  let number = 1001;
  for (let i = 0; i < 36; i++) {
    const shop = pick(DEMO_SHOPS);
    const shopProducts = DEMO_PRODUCTS.filter((p) => p.shopId === shop.id && p.status === "active");
    const lineCount = between(1, Math.min(3, shopProducts.length));
    const chosen = [...shopProducts].sort(() => rand() - 0.5).slice(0, lineCount);
    const buyer = pick(buyers);
    const age = between(0, 34);
    const created = daysAgo(age, between(9, 20));
    const items = chosen.map((p, idx) => ({
      id: `oi-${number}-${idx}`,
      productId: p.id,
      productSlug: p.slug,
      title: p.title,
      price: p.price,
      quantity: between(1, 2),
      imageUrl: p.images[0]?.url ?? null,
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const promo = rand() < 0.25 ? pick(DEMO_PROMO_CODES) : null;
    const discount = promo ? Math.floor((subtotal * promo.percent) / 100) : 0;
    const paymentMethod = rand() < 0.7 ? "card_demo" : "cod";
    const status = STATUS_BY_AGE(age);
    orders.push({
      id: `ord-${number}`,
      number: `LV-${number}`,
      buyerId: buyer.id,
      shopId: shop.id,
      status,
      subtotal,
      discount,
      total: subtotal - discount,
      promoCode: promo?.code ?? null,
      delivery: {
        fullName: buyer.fullName,
        phone: `+380 ${between(50, 99)} ${between(100, 999)} ${between(10, 99)} ${between(10, 99)}`,
        city: pick(CITIES),
        branch: `Відділення №${between(1, 120)}`,
        comment: rand() < 0.3 ? "Будь ласка, зателефонуйте перед доставкою." : "",
      },
      paymentMethod,
      paymentStatus: status === "cancelled" ? "refunded" : paymentMethod === "card_demo" ? "paid" : status === "delivered" ? "paid" : "pending",
      items,
      createdAt: created.toISOString(),
      updatedAt: new Date(created.getTime() + between(1, 48) * 3_600_000).toISOString(),
    });
    number++;
  }
  return orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
})();

const CHAT_SCRIPTS: [string, string][][] = [
  [
    ["buyer", "Добрий день! Чи можна зробити чашку «Ранок» у трохи більшому розмірі, на 400 мл?"],
    ["seller", "Вітаю! Так, можу виліпити на 400 мл, це +2 дні до відправки і +80 ₴ до ціни. Підходить?"],
    ["buyer", "Чудово, підходить. А колір глазурі можна залишити молочний?"],
    ["seller", "Звісно, молочна глазур — моя улюблена. Оформлюйте замовлення, у коментарі напишіть «400 мл»."],
  ],
  [
    ["buyer", "Вітаю! Набір піал «Палітра» можна відправити у Львів Новою поштою?"],
    ["seller", "Так, відправляю щодня, крім неділі. Кожну піалу загортаю окремо в стружку."],
    ["buyer", "Дякую, замовляю!"],
  ],
  [
    ["buyer", "Доброго дня, чи є ваза «Крапелька» в наявності? На сайті показує нуль."],
    ["seller", "Доброго! Нова партія буде за тиждень після випалу. Можу написати, коли з'явиться."],
  ],
];

export const DEMO_CONVERSATIONS: Conversation[] = [];
export const DEMO_MESSAGES: Message[] = [];

(() => {
  const shop = DEMO_SHOPS[0]; // Глиняний дім — the demo seller account
  CHAT_SCRIPTS.forEach((script, i) => {
    const buyer = buyers[i % buyers.length];
    const convId = `conv-${i + 1}`;
    const start = daysAgo(between(1, 6), between(9, 18));
    let last = start;
    script.forEach(([who, body], j) => {
      const at = new Date(start.getTime() + j * between(5, 40) * 60_000);
      last = at;
      DEMO_MESSAGES.push({
        id: `msg-${i + 1}-${j + 1}`,
        conversationId: convId,
        senderId: who === "buyer" ? buyer.id : shop.ownerId,
        body,
        createdAt: at.toISOString(),
        readAt: j === script.length - 1 && who === "buyer" ? null : at.toISOString(),
      });
    });
    DEMO_CONVERSATIONS.push({
      id: convId,
      buyerId: buyer.id,
      shopId: shop.id,
      lastMessageAt: last.toISOString(),
      lastMessagePreview: script[script.length - 1][1],
      unreadCount: 0,
    });
  });
})();

export function emptySeries(days: number): DailyPoint[] {
  return Array.from({ length: days }, (_, i) => ({ day: dayKey(daysAgo(days - 1 - i)), value: 0 }));
}

export { userName as demoUserName };
