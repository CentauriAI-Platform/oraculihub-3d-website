import { courses } from "@/lib/db";
import { CourseCatalog } from "@/components/course-catalog";
export const dynamic = "force-dynamic";
export const metadata = { title: "Explore courses" };
export default function Courses() {
  return (
    <div className="page-shell">
      <div className="page-intro">
        <span className="eyebrow">THE LIBRARY OF POSSIBILITY</span>
        <h1>
          Curiosity is
          <br />
          <em>a powerful beginning.</em>
        </h1>
        <p>Practical skills. New perspectives. Your next step starts here.</p>
      </div>
      <div className="notice">
        The library currently contains illustrative courses and sample lessons.
        Prices shown are examples; sample courses cannot be purchased.
      </div>
      <CourseCatalog courses={courses()} />
    </div>
  );
}
