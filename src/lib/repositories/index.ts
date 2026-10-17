import { hasSupabase } from "@/lib/supabase/env";
import { mockAuthService } from "./mock/auth";
import { mockCatalogRepository } from "./mock/catalog";
import { mockSellerRepository } from "./mock/seller";
import { mockUserDataRepository } from "./mock/user-data";
import { supabaseAuthService } from "./supabase/auth";
import { supabaseCatalogRepository } from "./supabase/catalog";
import { supabaseSellerRepository } from "./supabase/seller";
import { supabaseUserDataRepository } from "./supabase/user-data";
import type { AuthService, CatalogRepository, SellerRepository, UserDataRepository } from "./types";

export type { AuthService, CatalogRepository, SellerRepository, UserDataRepository } from "./types";

/**
 * True when the app runs on built-in demo data instead of Supabase:
 * either no Supabase keys are configured, or LAVKA_DATA_SOURCE=demo forces it.
 */
export function isDemoMode(): boolean {
  return process.env.LAVKA_DATA_SOURCE === "demo" || !hasSupabase();
}

export function getCatalogRepository(): CatalogRepository {
  return isDemoMode() ? mockCatalogRepository : supabaseCatalogRepository;
}

export function getSellerRepository(): SellerRepository {
  return isDemoMode() ? mockSellerRepository : supabaseSellerRepository;
}

export function getUserDataRepository(): UserDataRepository {
  return isDemoMode() ? mockUserDataRepository : supabaseUserDataRepository;
}

export function getAuthService(): AuthService {
  return isDemoMode() ? mockAuthService : supabaseAuthService;
}
