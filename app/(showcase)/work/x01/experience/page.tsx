import { Closing } from "@/components/showcase/x01/closing";
import { Hero } from "@/components/showcase/x01/hero";
import { IndexList } from "@/components/showcase/x01/index-catalog";
import { Manifesto } from "@/components/showcase/x01/manifesto";
import { ObjectStudy } from "@/components/showcase/x01/object-study";
import { Pendulum } from "@/components/showcase/x01/pendulum";
import { Pressure } from "@/components/showcase/x01/pressure";
import { Veil } from "@/components/showcase/x01/veil";

export default function X01ExperiencePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <ObjectStudy />
      <Veil />
      <Pendulum />
      <Pressure />
      <IndexList />
      <Closing />
    </>
  );
}
