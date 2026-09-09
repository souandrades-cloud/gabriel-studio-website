/**
 * Gate 07B — Director Iteration 001 — Unified Opening Track.
 *
 * OLD ownership model: Hero and MaterialMechanism were two independent
 * `position: sticky` tracks, each with its own wrapper taller than its own
 * 100vh sticky child (a scroll "budget"). CSS sticky release for a wrapper
 * of height H with a 100vh child happens exactly (H-100vh) of scroll after
 * the wrapper's top reaches the viewport top — at that instant the sticky
 * child still exactly fills the viewport. But it does not disappear there:
 * it reverts to a normal (non-sticky) position flush with the wrapper's own
 * bottom edge, and needs a FURTHER full 100vh (=1 viewport height) of scroll
 * to fully scroll off past the viewport top — during which the NEXT
 * wrapper's sticky child has not yet engaged (it only starts once ITS OWN
 * wrapper's top reaches the viewport top, which happens only once the FIRST
 * wrapper has fully cleared). That gap is exactly 1 viewport height,
 * regardless of either wrapper's budget — verified empirically (computed
 * transforms identical on both sides, bounding-rect probe confirms the
 * ~900px/1440x900 zone). During that gap BOTH sections are simultaneously
 * partially visible: the releasing one shows its own BOTTOM rows compressed
 * into the top of the viewport, the not-yet-engaged one shows its own TOP
 * rows compressed into the bottom — i.e. the frame's bottom appears above
 * its own top, a discontinuity independent of whether the two sides'
 * content matches. This is what Gate 07B's browser-real QA caught.
 *
 * NEW ownership model: Hero absorbs MaterialMechanism's own A-001 push +
 * crossfade + material-scale-hold phase (old MaterialMechanism local
 * progress 0 to MATERIAL_ESTABLISHED_FRACTION) into ONE sticky track —
 * zero internal release/re-engage boundary across the entire "OPENING ->
 * A-001 APPROACH -> A-002 MATERIAL ESTABLISHED" span the gate brief scopes.
 * MaterialMechanism keeps ONLY the A-003 mask-reveal + settle phase (old
 * local MATERIAL_ESTABLISHED_FRACTION to 1), re-scoped to its own 0-1
 * range and a proportionally smaller wrapper — same values, same grammar,
 * same technique (see that file's own comments), just a smaller container.
 * The one remaining seam (unified track -> this trimmed downstream track)
 * hands off at MATERIAL_ESTABLISHED_FRACTION specifically because nothing
 * is animating there in either direction: MATERIAL_SCALE_TIMELINE finishes
 * settling AND MASK_RANGE/SETTLE_TIMELINE both start there, so both sides
 * of that boundary render the identical static, fully-settled A-002 frame
 * — not eliminated in the CSS-mechanics sense, but the ~1-viewport zone
 * shows an unchanging held frame rather than two different points in an
 * active camera move, which is the perceptual defect the gate brief flags.
 */
export const MATERIAL_ESTABLISHED_FRACTION = 0.61;

// Old per-track scroll budgets (wrapper height - 100vh sticky child), the
// source of truth both hero.tsx and material-mechanism.tsx derive from so
// the two files can't drift apart on these numbers.
export const DESKTOP_HERO_BUDGET_VH = 60; // old Hero: 160vh - 100vh
export const DESKTOP_MM_BUDGET_VH = 200; // old MaterialMechanism: 300vh - 100vh
export const MOBILE_HERO_BUDGET_VH = 30; // old Hero: 130vh - 100vh
export const MOBILE_MM_BUDGET_VH = 185; // old MaterialMechanism: 285vh - 100vh
