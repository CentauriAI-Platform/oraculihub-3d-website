import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, BarChart3 } from "lucide-react";
import { money, pathways, type Course } from "@/lib/catalog";
export function CourseCard({ course }: { course: Course }) {
  const p = pathways.find((p) => p.id === course.pathway);
  return (
    <Link href={`/courses/${course.slug}`} className="course-card">
      <div className="course-art">
        <Image
          src={course.image}
          alt={`${p?.name ?? "Pathway"} statue`}
          fill
          sizes="(max-width:700px) 90vw, 33vw"
        />
        <span className="course-path">{p?.specialty}</span>
        <ArrowUpRight className="course-art-arrow" size={23} />
        {!!course.demo && <span className="demo-badge">SAMPLE COURSE</span>}
      </div>
      <div className="course-info">
        <div className="course-meta">
          <span>
            <BarChart3 size={13} />
            {course.level}
          </span>
          <span>
            <Clock3 size={13} />
            {course.duration}
          </span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.subtitle}</p>
        <div className="course-price">
          <span>
            {course.price ? money(course.price) : "Free to explore"}
            {!!course.demo && course.price > 0 && (
              <small>Illustrative price</small>
            )}
          </span>
          <span>
            Explore course <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
