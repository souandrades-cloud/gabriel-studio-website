import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** CTA de exploração do trabalho — mesmo destino, "/work", usado na Home real e nos protótipos que a compararam. */
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
