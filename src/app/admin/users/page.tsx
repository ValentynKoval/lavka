import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminRepository } from "@/lib/repositories";
import { UserRoleControl } from "@/components/admin/admin-controls";

export const metadata: Metadata = { title: "Адмін · Користувачі" };

const dateFormat = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" });
const roleLabel = { buyer: "Покупець", seller: "Майстер", admin: "Адмін" } as const;

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAdminRepository().listUsers();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Користувачі</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Користувачі · {users.length}</h1>
        <p className="mt-2 text-sm text-ink-500">Зміна ролі виконується через сервісний ключ — звичайні користувачі не можуть підвищити себе самі.</p>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-linen-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Користувач</th>
              <th className="px-3 py-3">Зареєстровано</th>
              <th className="px-5 py-3">Роль</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-linen-50/60">
                <td className="px-5 py-3">
                  <p className="font-semibold text-ink-900">{u.fullName || "Без імені"}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </td>
                <td className="px-3 py-3 text-ink-700">{dateFormat.format(new Date(u.createdAt))}</td>
                <td className="px-5 py-3">
                  {u.id === admin.id ? <span className="text-xs font-semibold text-ink-500">{roleLabel[u.role]} (ви)</span> : <UserRoleControl userId={u.id} role={u.role} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
