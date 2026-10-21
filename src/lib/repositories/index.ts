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
import {
  mockAdminRepository,
  mockChatRepository,
  mockOrdersRepository,
  mockReviewsRepository,
  mockStatsRepository,
} from "./mock/stage2";
import {
  supabaseAdminRepository,
  supabaseChatRepository,
  supabaseOrdersRepository,
  supabaseReviewsRepository,
  supabaseStatsRepository,
} from "./supabase/stage2";
import type { AdminRepository, ChatRepository, OrdersRepository, ReviewsRepository, StatsRepository } from "./types-stage2";
import { mockCollectionsRepository, mockCommissionsRepository, mockNotificationsRepository, mockQuestionsRepository } from "./mock/stage3";
import { supabaseCollectionsRepository, supabaseCommissionsRepository, supabaseNotificationsRepository, supabaseQuestionsRepository } from "./supabase/stage3";
import type { CollectionsRepository, CommissionsRepository, NotificationsRepository, QuestionsRepository } from "./types-stage3";

export type { AuthService, CatalogRepository, SellerRepository, UserDataRepository } from "./types";
export type { AdminRepository, ChatRepository, OrdersRepository, ReviewsRepository, StatsRepository } from "./types-stage2";
export type { CollectionsRepository, CommissionsRepository, NotificationsRepository, QuestionsRepository } from "./types-stage3";

export function getCommissionsRepository(): CommissionsRepository {
  return isDemoMode() ? mockCommissionsRepository : supabaseCommissionsRepository;
}

export function getNotificationsRepository(): NotificationsRepository {
  return isDemoMode() ? mockNotificationsRepository : supabaseNotificationsRepository;
}

export function getCollectionsRepository(): CollectionsRepository {
  return isDemoMode() ? mockCollectionsRepository : supabaseCollectionsRepository;
}

export function getQuestionsRepository(): QuestionsRepository {
  return isDemoMode() ? mockQuestionsRepository : supabaseQuestionsRepository;
}

export function getOrdersRepository(): OrdersRepository {
  return isDemoMode() ? mockOrdersRepository : supabaseOrdersRepository;
}

export function getReviewsRepository(): ReviewsRepository {
  return isDemoMode() ? mockReviewsRepository : supabaseReviewsRepository;
}

export function getChatRepository(): ChatRepository {
  return isDemoMode() ? mockChatRepository : supabaseChatRepository;
}

export function getStatsRepository(): StatsRepository {
  return isDemoMode() ? mockStatsRepository : supabaseStatsRepository;
}

export function getAdminRepository(): AdminRepository {
  return isDemoMode() ? mockAdminRepository : supabaseAdminRepository;
}

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
