import { getTitleSegments } from "@/lib/portfolio/title-segments";

/**
 * Renders a project title keeping hyphenated compounds together
 * ("Question-Driven" never splits into "Question-" / "Driven" when the next
 * line has room). `inline-block` rather than `whitespace-nowrap`: an atomic
 * inline box moves to the next line whole, but if it is ever wider than the
 * line itself it still wraps inside, so a narrow viewport never overflows.
 * The text content is unchanged, for screen readers and copy alike.
 */
function ProjectTitle({ title }: { title: string }) {
  return getTitleSegments(title).map((segment, index) =>
    segment.compound ? (
      <span key={index} className="inline-block">
        {segment.text}
      </span>
    ) : (
      segment.text
    ),
  );
}

export { ProjectTitle };
