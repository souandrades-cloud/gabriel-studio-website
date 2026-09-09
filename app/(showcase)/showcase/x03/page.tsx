import { FieldAction } from "@/components/showcase/x03/field-action";
import { Hero } from "@/components/showcase/x03/hero";
import { HybridReturn } from "@/components/showcase/x03/hybrid-return";
import { MachinePerception } from "@/components/showcase/x03/machine-perception";
import { MachineSignal } from "@/components/showcase/x03/machine-signal";
import { MaterialMechanism } from "@/components/showcase/x03/material-mechanism";

export default function X03Page() {
  return (
    <>
      <Hero />
      <MaterialMechanism />
      <MachineSignal />
      <MachinePerception />
      <FieldAction />
      <HybridReturn />
    </>
  );
}
