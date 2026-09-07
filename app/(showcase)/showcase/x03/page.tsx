import { FieldAction } from "@/components/showcase/x03/field-action";
import { Hero } from "@/components/showcase/x03/hero";
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
    </>
  );
}
