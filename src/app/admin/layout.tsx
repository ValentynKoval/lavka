import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-linen-50">Адмін</span>
        <p className="text-sm text-ink-500">Модерація та статистика платформи</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
