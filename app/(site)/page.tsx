import { About } from "@/components/sections/about";
import { Differentials } from "@/components/sections/differentials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { HeroEcosystem } from "@/components/sections/hero-ecosystem";
import { Portfolio } from "@/components/sections/portfolio";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Technologies } from "@/components/sections/technologies";

export default function Home() {
  return (
    <>
      <HeroEcosystem />
      <Services />
      <Process />
      <Portfolio />
      <Technologies />
      <Differentials />
      <About />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
