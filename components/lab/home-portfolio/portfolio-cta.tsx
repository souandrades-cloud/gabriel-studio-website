import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** CTA final compartilhado pelos três protótipos — mesmo destino, "/work", pedido pelo Gate para as três hipóteses. */
function PortfolioCta() {
  return (
    <div className="mt-16 flex justify-center sm:mt-20">
      <Link
        href="/work"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
      >
        Explorar todo o trabalho
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export { PortfolioCta };
