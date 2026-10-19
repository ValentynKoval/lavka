import { Compass } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function NotFound() {
  const { t } = await getTranslator();
  return (
    <div className="container-page py-20">
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title={t("notFound.title")}
        description={t("notFound.text")}
        action={<Button href="/catalog">{t("common.toCatalog")}</Button>}
      />
    </div>
  );
}
