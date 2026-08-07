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
