import { DEMO_PRODUCTS, DEMO_SHOPS, DEMO_USERS, type DemoUser } from "@/data/demo";
import type { Product, Shop } from "@/lib/types";

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
}

const KEY = "__lavkaMockState" as const;

function createState(): MockState {
  return {
    users: structuredClone(DEMO_USERS),
    shops: structuredClone(DEMO_SHOPS),
    products: structuredClone(DEMO_PRODUCTS),
    favorites: new Map(),
    carts: new Map(),
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
