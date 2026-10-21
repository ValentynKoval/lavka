import { DEMO_PRODUCTS, DEMO_SHOPS, DEMO_USERS, type DemoUser } from "@/data/demo";
import { DEMO_CONVERSATIONS, DEMO_MESSAGES, DEMO_ORDERS, DEMO_PROMO_CODES, DEMO_REVIEWS, DEMO_VIEWS } from "@/data/demo-stage2";
import type { Collection, CollectionItem, Commission, Conversation, Message, Notification, Order, Product, ProductQuestion, PromoCode, Review, Shop } from "@/lib/types";

/**
 * In-memory state for demo mode (no Supabase keys).
 * Lives on globalThis so it survives HMR in development; on serverless hosts
 * it lasts for the lifetime of a warm instance, which is enough for a demo.
 */
export interface MockState {
  users: DemoUser[];
  shops: Shop[];
  products: Product[];
  favorites: Map<string, Set<string>>;
  carts: Map<string, Map<string, number>>;
  reviews: Review[];
  orders: Order[];
  promoCodes: PromoCode[];
  conversations: Conversation[];
  messages: Message[];
  views: { productId: string; day: string; views: number }[];
  orderCounter: number;
  commissions: Commission[];
  notifications: Notification[];
  collections: Collection[];
  collectionItems: (CollectionItem & { collectionId: string })[];
  questions: ProductQuestion[];
}

const KEY = "__lavkaMockState" as const;

function createState(): MockState {
  return {
    users: structuredClone(DEMO_USERS),
    shops: structuredClone(DEMO_SHOPS),
    products: structuredClone(DEMO_PRODUCTS),
    favorites: new Map(),
    carts: new Map(),
    reviews: structuredClone(DEMO_REVIEWS),
    orders: structuredClone(DEMO_ORDERS),
    promoCodes: structuredClone(DEMO_PROMO_CODES),
    conversations: structuredClone(DEMO_CONVERSATIONS),
    messages: structuredClone(DEMO_MESSAGES),
    views: structuredClone(DEMO_VIEWS),
    orderCounter: 1001 + DEMO_ORDERS.length,
    commissions: [],
    notifications: [],
    collections: [],
    collectionItems: [],
    questions: [],
  };
}

export function getMockState(): MockState {
  const g = globalThis as typeof globalThis & { [KEY]?: MockState };
  if (!g[KEY]) g[KEY] = createState();
  return g[KEY];
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
