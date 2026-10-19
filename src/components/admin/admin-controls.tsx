"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";
import { adminSetProductStatusAction, adminSetShopHiddenAction, adminSetUserRoleAction } from "@/lib/admin/actions";
import type { ProductStatus, UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

function useAction() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ error?: string }>, ok: string) =>
    start(async () => {
      const result = await fn();
      if (result.error) toast.error(result.error);
      else {
        toast.success(ok);
        router.refresh();
      }
    });
  return { pending, run };
}

export function ProductStatusControl({ productId, status }: { productId: string; status: ProductStatus }) {
  const { t } = useT();
  const { pending, run } = useAction();
  return (
    <Select value={status} disabled={pending} onChange={(e) => run(() => adminSetProductStatusAction(productId, e.target.value as ProductStatus), t("admin.products.updated"))} className="h-9 w-44 text-xs" aria-label={t("admin.products.statusAria")}>
      <option value="active">{t("admin.products.statusActive")}</option>
      <option value="draft">{t("admin.products.statusDraft")}</option>
      <option value="archived">{t("admin.products.statusArchived")}</option>
    </Select>
  );
}

export function ShopHiddenControl({ shopId, hidden }: { shopId: string; hidden: boolean }) {
  const { t } = useT();
  const { pending, run } = useAction();
  return (
    <Button size="sm" variant={hidden ? "primary" : "danger"} loading={pending} onClick={() => run(() => adminSetShopHiddenAction(shopId, !hidden), hidden ? t("admin.shops.shownToast") : t("admin.shops.hiddenToast"))}>
      {hidden ? t("admin.shops.show") : t("admin.shops.hide")}
    </Button>
  );
}

export function UserRoleControl({ userId, role, disabled }: { userId: string; role: UserRole; disabled?: boolean }) {
  const { t } = useT();
  const { pending, run } = useAction();
  return (
    <Select value={role} disabled={pending || disabled} onChange={(e) => run(() => adminSetUserRoleAction(userId, e.target.value as UserRole), t("admin.users.updated"))} className="h-9 w-36 text-xs" aria-label={t("admin.users.roleAria")}>
      <option value="buyer">{t("admin.users.roleBuyer")}</option>
      <option value="seller">{t("admin.users.roleSeller")}</option>
      <option value="admin">{t("admin.users.roleAdmin")}</option>
    </Select>
  );
}
