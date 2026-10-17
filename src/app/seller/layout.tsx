import { requireUser } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { SellerNav } from "@/components/seller/seller-nav";

export default async function SellerLayout({ children }: LayoutProps<"/seller">) {
  const user = await requireUser("/seller");
  const shop = await getSellerRepository().getShopByOwner(user.id);
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <SellerNav shop={shop} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
