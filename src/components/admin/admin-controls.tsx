"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const { pending, run } = useAction();
  return (
    <Select
      value={status}
      disabled={pending}
      onChange={(e) => run(() => adminSetProductStatusAction(productId, e.target.value as ProductStatus), "Статус товару оновлено")}
      className="h-9 w-40 text-xs"
      aria-label="Статус товару"
    >
      <option value="active">Активний</option>
      <option value="draft">Чернетка</option>
      <option value="archived">В архіві (приховано)</option>
    </Select>
  );
}

export function ShopHiddenControl({ shopId, hidden }: { shopId: string; hidden: boolean }) {
  const { pending, run } = useAction();
  return (
    <Button size="sm" variant={hidden ? "primary" : "danger"} loading={pending} onClick={() => run(() => adminSetShopHiddenAction(shopId, !hidden), hidden ? "Лавку показано" : "Лавку приховано")}>
      {hidden ? "Показати лавку" : "Приховати лавку"}
    </Button>
  );
}

export function UserRoleControl({ userId, role, disabled }: { userId: string; role: UserRole; disabled?: boolean }) {
  const { pending, run } = useAction();
  return (
    <Select
      value={role}
      disabled={pending || disabled}
      onChange={(e) => run(() => adminSetUserRoleAction(userId, e.target.value as UserRole), "Роль оновлено")}
      className="h-9 w-36 text-xs"
      aria-label="Роль користувача"
    >
      <option value="buyer">Покупець</option>
      <option value="seller">Майстер</option>
      <option value="admin">Адмін</option>
    </Select>
  );
}
