import { About } from "@/components/sections/about";
import { Differentials } from "@/components/sections/differentials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { HeroDigitalCore3D } from "@/components/sections/hero-digital-core-3d";
import { Process } from "@/components/sections/process";
import { Projects } from "@/components/sections/projects";
import { Services } from "@/components/sections/services";
import { Systems } from "@/components/sections/systems";
import { Technologies } from "@/components/sections/technologies";

export default function Home() {
  return (
    <>
      <HeroDigitalCore3D />
      <Services />
      <Process />
      <Projects />
      <Systems />
      <Technologies />
      <Differentials />
      <About />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
