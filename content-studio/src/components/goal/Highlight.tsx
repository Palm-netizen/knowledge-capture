import { Fragment } from "react";
import { cn } from "@/lib/utils";

/** Renders text, turning ==phrase== into a marker-style highlight. Newlines become <br/>. */
export function Highlight({ text, tone = "yellow", className }: { text: string; tone?: "yellow" | "blue" | "light"; className?: string }) {
  const parts = text.split(/(==[^=]+==)/g);
  const markClass =
    tone === "light"
      ? "bg-[linear-gradient(transparent_62%,rgba(255,138,31,0.9)_62%)] text-white"
      : tone === "blue"
        ? "bg-[linear-gradient(transparent_50%,#D6E0FF_50%)] text-ink"
        : "bg-[linear-gradient(transparent_50%,#FFE58A_50%)] text-ink";
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith("==") && p.endsWith("==")) {
          return (
            <mark key={i} className={cn("rounded-[2px] bg-transparent px-0.5 font-semibold [box-decoration-break:clone]", markClass)}>
              {p.slice(2, -2)}
            </mark>
          );
        }
        return (
          <Fragment key={i}>
            {p.split("\n").map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </Fragment>
        );
      })}
    </span>
  );
}
