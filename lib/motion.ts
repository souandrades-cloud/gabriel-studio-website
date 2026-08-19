/**
 * Shared scroll/entrance reveal: fades in and slides up, staggered by index
 * via the `custom` prop. `staggerDelay` controls the seconds between items.
 */
export function fadeUp(staggerDelay = 0.08) {
  return {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * staggerDelay, ease: "easeOut" as const },
    }),
  };
}

/**
 * Fades in with a touch more weight: slight scale + slide, for blocks that
 * should read as "settling into place" rather than just fading (cards,
 * featured blocks). Staggered by index via the `custom` prop.
 */
export function scaleIn(staggerDelay = 0.08) {
  return {
    hidden: { opacity: 0, y: 16, scale: 0.96 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, delay: i * staggerDelay, ease: "easeOut" as const },
    }),
  };
}

/**
 * Masked line reveal: the line slides up from fully hidden (100% down) to
 * its resting position. Pair with an `overflow-hidden` wrapper per line so
 * only the reveal is visible, not the travel. Staggered by index.
 */
export function lineReveal(staggerDelay = 0.12) {
  return {
    hidden: { y: "100%" },
    visible: (i: number) => ({
      y: "0%",
      transition: {
        duration: 0.7,
        delay: i * staggerDelay,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };
}
