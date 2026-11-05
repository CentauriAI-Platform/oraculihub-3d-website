import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pathways } from "@/lib/catalog";
export function ScenePathwayLabels({ visible }: { visible: boolean }) {
  return (
    <nav
      className="scene-pathway-labels"
      aria-label="Shrine pathways"
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {pathways.map((p) => (
        <Link key={p.id} href={p.href} tabIndex={visible ? 0 : -1}>
          <span>
            {p.roman} · {p.specialty}
          </span>
          <strong>
            {p.name}
            <ArrowUpRight size={14} />
          </strong>
        </Link>
      ))}
    </nav>
  );
}
