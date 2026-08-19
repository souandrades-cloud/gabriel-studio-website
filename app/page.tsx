import { About } from "@/components/sections/about";
import { Differentials } from "@/components/sections/differentials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Projects } from "@/components/sections/projects";
import { Services } from "@/components/sections/services";
import { Technologies } from "@/components/sections/technologies";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Process />
      <Projects />
      <Technologies />
      <Differentials />
      <About />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  );
}
