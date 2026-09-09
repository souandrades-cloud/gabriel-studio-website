"use client";

import Image from "next/image";

import { A001_SRC, clamp01, smoothstep } from "./constants";

export interface ProductResolveProps {
  /** 0-1 local progress: PL-1 settling in, then the identity line, then
   *  (Bookend only) the quiet nav resolution. */
  t: number;
  tagline: string;
  /** Bookend-only: a restrained editorial nav test, never a CTA. Omitted
   *  by Hybrid, whose resolve is meant to read as quieter/later. */
  showNav?: boolean;
}

/**
 * The PRODUCT beat both Hypothesis A and C end on: A-001, full body,
 * centered — the same master reference used everywhere else in X03, not a
 * re-staged shot. Shared rather than forked because the Signature Test
 * ("the body seen at the beginning must mean more than it did before") is
 * about THIS exact frame regardless of which route arrives at it.
 */
export function ProductResolve({ t, tagline, showNav }: ProductResolveProps) {
  const reveal = smoothstep(t);
  const scale = 0.94 + reveal * 0.06;
  const taglineT = smoothstep(clamp01((t - 0.35) / 0.35));
  const navT = smoothstep(clamp01((t - 0.72) / 0.28));

  return (
    <div className="x03-return-product" style={{ opacity: reveal }} aria-hidden="true">
      <Image
        src={A001_SRC}
        alt="PL-1 — PROPRIO"
        fill
        sizes="960px"
        className="x03-return-product-photo"
        style={{ objectFit: "contain", transform: `scale(${scale})` }}
      />
      <div className="x03-return-caption x03-return-caption-center" style={{ opacity: taglineT }}>
        <span className="x03-return-caption-tag">PROPRIO — PL-1</span>
        <span className="x03-return-caption-line">{tagline}</span>
      </div>
      {showNav && (
        <div className="x03-return-nav" style={{ opacity: navT }}>
          <span>Overview</span>
          <span>Contact</span>
        </div>
      )}
    </div>
  );
}
