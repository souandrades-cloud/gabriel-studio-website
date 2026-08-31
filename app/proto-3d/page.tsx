import { HeroDigitalCore3D } from "@/components/sections/hero-digital-core-3d";

export default function Proto3D() {
  return (
    <>
      <HeroDigitalCore3D />
      {/* Placeholder só para permitir testar o scroll-exit da Hero nesta rota
          isolada — a rota real terá Serviços logo em seguida. */}
      <div className="bg-background h-[1200px]" aria-hidden="true" />
    </>
  );
}
