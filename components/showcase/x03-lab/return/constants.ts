/**
 * X03 LAB — PROPRIO. Gate 06A — Return / Resolution Discovery.
 * Shared math reused verbatim from Gate 05A (clamp01/smoothstep/windowT),
 * same discipline as every later gate. ROUTE_ACCENT is Gate 05C's own
 * export re-imported, not redefined — the one visual thread this gate
 * still owes continuity to on its very first frame.
 */
import { ROUTE_ACCENT } from "../field-action/constants";
import { clamp01, smoothstep, windowT } from "../field/utils";

export { clamp01, smoothstep, windowT, ROUTE_ACCENT };

export const A001_SRC = "/images/x03/x03-a001-pl1-master.png";
/** Gate 06A brief: "existing approved assets... A-006/A-007/A-008... frozen."
 *  Field Action's own annotations call these placeholders for photography
 *  that "does not exist yet" — but the files ARE the approved wide-context
 *  photography this gate needs for WHERE/WHY, so this gate is the first to
 *  actually use them. A-007 (LOAD) is deliberately left unused below: using
 *  all three would re-perform Gate 05C's CONTACT→LOAD→COMMIT beats, which
 *  is a failure condition here. One wide frame (A-008, past the constraint)
 *  is enough to resolve WHERE without repeating the mechanism.
 */
export const A008_SRC = "/images/x03/x03-a008-field-commit.png";

/** The exact crop Gate 05C's CONSEQUENCE beat resolves to (field-action/
 *  sequence-stage.tsx TIGHT_POSITION) — reused so this gate's opening frame
 *  is a true continuation, not a redraw. */
export const HANDOFF_CROP_POSITION = "16% 80%";
