import Link from "next/link";
import { Hammer } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Entry point to the commission flow from a product or a shop page. */
export async function CommissionRequestButton({ shopSlug, productSlug, variant = "link", className }: { shopSlug: string; productSlug?: string; variant?: "link" | "button"; className?: string }) {
  const { t } = await getTranslator();
  const href = `/commissions/new?shop=${shopSlug}${productSlug ? `&product=${productSlug}` : ""}`;
  if (variant === "button") {
    return (
      <Link href={href} className={buttonClasses({ variant: "outline", className })}>
        <Hammer className="h-4 w-4" /> {t("commissions.requestCta")}
      </Link>
    );
  }
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 text-sm font-semibold text-clay-600 hover:underline", className)}>
      <Hammer className="h-4 w-4" /> {t("commissions.requestCta")}
    </Link>
  );
}
