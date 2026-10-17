import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState
        icon={<Compass className="h-6 w-6" />}
        title="Такої сторінки немає"
        description="Можливо, майстер зняв виріб із продажу або посилання застаріло. Поверніться до каталогу — там точно є щось цікаве."
        action={<Button href="/catalog">До каталогу</Button>}
      />
    </div>
  );
}
