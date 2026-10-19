import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminRepository } from "@/lib/repositories";
import { UserRoleControl } from "@/components/admin/admin-controls";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.adminUsers") };
}

export default async function AdminUsersPage() {
  const { t, formatDate } = await getTranslator();
  const admin = await requireAdmin();
  const users = await getAdminRepository().listUsers();
  const roleLabel = { buyer: t("admin.users.roleBuyer"), seller: t("admin.users.roleSeller"), admin: t("admin.users.roleAdmin") } as const;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("admin.users.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("admin.users.title")} · {users.length}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("admin.users.intro")}</p>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-linen-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">{t("admin.users.colUser")}</th>
              <th className="px-3 py-3">{t("admin.users.colRegistered")}</th>
              <th className="px-5 py-3">{t("admin.users.colRole")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-linen-50/60">
                <td className="px-5 py-3">
                  <p className="font-semibold text-ink-900">{u.fullName || t("common.noName")}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </td>
                <td className="px-3 py-3 text-ink-700">{formatDate(u.createdAt, { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-3">
                  {u.id === admin.id ? <span className="text-xs font-semibold text-ink-500">{roleLabel[u.role]} {t("common.you")}</span> : <UserRoleControl userId={u.id} role={u.role} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
