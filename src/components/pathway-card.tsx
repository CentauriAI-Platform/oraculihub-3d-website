import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { pathways } from "@/lib/catalog";
export function PathwayCards() {
  return (
    <div className="pathway-grid">
      {pathways.map((p) => (
        <Link
          href={p.href}
          className="pathway-card"
          key={p.id}
          style={{ "--pathway-color": p.color } as React.CSSProperties}
        >
          <Image
            src={`/images/${p.id}.webp`}
            alt={`A marble statue of ${p.name} in the firelit shrine`}
            fill
            sizes="(max-width:600px) 85vw, (max-width:1000px) 45vw, 25vw"
          />
          <div className="pathway-card-shade" />
          <div className="pathway-top">
            <span>{p.roman}</span>
            <ArrowUpRight size={20} />
          </div>
          <div className="pathway-card-content">
            <span className="eyebrow">{p.specialty}</span>
            <h3>{p.name}</h3>
            <p>{p.short}</p>
            <span className="pathway-enter">
              Explore this path <ArrowUpRight size={15} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
