"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getCollectionsRepository } from "@/lib/repositories";
import type { Collection } from "@/lib/types";

export interface CollectionFormState {
  error?: string;
  success?: boolean;
  created?: Collection;
}

export async function createCollectionAction(_prev: CollectionFormState, formData: FormData): Promise<CollectionFormState> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().trim().min(2, t("collections.errors.title")).max(80),
      description: z.string().trim().max(400),
      isPublic: z.boolean(),
      productId: z.string().optional(),
    })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description") ?? "",
      isPublic: formData.get("isPublic") !== "0",
      productId: String(formData.get("productId") ?? "") || undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const repo = getCollectionsRepository();
    const created = await repo.create(user.id, parsed.data.title, parsed.data.description, parsed.data.isPublic);
    if (parsed.data.productId) await repo.setItem(user.id, created.id, parsed.data.productId, true);
    revalidatePath("/collections");
    return { success: true, created };
  } catch (e) {
    return { error: localizeError(translator, e, "collections.errors.create") };
  }
}

export async function toggleCollectionItemAction(collectionId: string, productId: string, on: boolean): Promise<{ error?: string }> {
  const translator = await getTranslator();
  const user = await requireUser();
  try {
    await getCollectionsRepository().setItem(user.id, collectionId, productId, on);
  } catch (e) {
    return { error: localizeError(translator, e, "collections.errors.update") };
  }
  revalidatePath("/collections");
  return {};
}

export async function listOwnCollectionsAction(productId?: string): Promise<{ collections: Collection[]; containing: string[] }> {
  const user = await requireUser();
  const repo = getCollectionsRepository();
  const [collections, containing] = await Promise.all([repo.listOwn(user.id), productId ? repo.collectionsWithProduct(user.id, productId) : Promise.resolve([])]);
  return { collections, containing };
}

export async function updateCollectionAction(id: string, patch: { title?: string; description?: string; isPublic?: boolean }): Promise<{ error?: string }> {
  const translator = await getTranslator();
  const user = await requireUser();
  try {
    await getCollectionsRepository().update(user.id, id, patch);
  } catch (e) {
    return { error: localizeError(translator, e, "collections.errors.update") };
  }
  revalidatePath("/collections");
  return {};
}

export async function deleteCollectionAction(id: string): Promise<{ error?: string }> {
  const translator = await getTranslator();
  const user = await requireUser();
  try {
    await getCollectionsRepository().remove(user.id, id);
  } catch (e) {
    return { error: localizeError(translator, e, "collections.errors.update") };
  }
  revalidatePath("/collections");
  return {};
}
