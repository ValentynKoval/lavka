import { getTranslator } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { t } = await getTranslator();
  await requireAdmin();
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-linen-50">{t("admin.badge")}</span>
        <p className="text-sm text-ink-500">{t("admin.intro")}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
