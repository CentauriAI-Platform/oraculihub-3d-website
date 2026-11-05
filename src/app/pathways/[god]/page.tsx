import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { pathways } from "@/lib/catalog";
import { courses } from "@/lib/db";
import { CourseCard } from "@/components/course-card";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ god: string }>;
}) {
  const { god } = await params;
  const p = pathways.find((p) => p.id === god);
  return { title: p ? `${p.name} · ${p.specialty}` : "Pathway" };
}
export default async function Pathway({
  params,
}: {
  params: Promise<{ god: string }>;
}) {
  const { god } = await params;
  const p = pathways.find((p) => p.id === god);
  if (!p) notFound();
  const available = courses().filter((c) => c.pathway === god);
  return (
    <>
      <section className="pathway-hero page-shell">
        <div>
          <Link className="breadcrumb" href="/#pathways">
            ← The hall of pathways
          </Link>
          <span className="eyebrow">
            {p.roman} · THE PATH OF {p.name.toUpperCase()}
          </span>
          <h1>
            {p.title.split(" ").slice(0, -1).join(" ")}
            <br />
            <em>{p.title.split(" ").slice(-1)}</em>
          </h1>
          <h3>{p.specialty}</h3>
          <p>{p.description}</p>
          <div className="pathway-tags">
            {p.tags.map((t) => (
              <span key={t}>
                <Check size={13} />
                {t}
              </span>
            ))}
          </div>
          <Link
            className="button button-gold"
            href={god === "athena" ? "/coaching" : "#path-courses"}
          >
            {god === "athena"
              ? "Explore personal coaching"
              : "Discover your courses"}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="pathway-portrait">
          <Image
            src={`/images/${god}.webp`}
            alt={`Statue of ${p.name}`}
            fill
            priority
            sizes="(max-width:700px) 90vw, 45vw"
          />
          <span>{p.name}</span>
        </div>
      </section>
      {available.length > 0 && (
        <section id="path-courses" className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR NEXT STEP</span>
              <h2>
                Knowledge to
                <br />
                <em>light your way.</em>
              </h2>
            </div>
            <p>
              Sample learning experiences.
              <br />A glimpse of what’s possible.
            </p>
          </div>
          <div className="course-grid">
            {available.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
