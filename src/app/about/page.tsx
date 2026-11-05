import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand";
export const metadata = { title: "Our story" };
export default function About() {
  return (
    <div className="page-shell about-page">
      <div className="page-intro">
        <span className="eyebrow">THE STORY BEHIND THE SHRINE</span>
        <h1>
          Old wisdom.
          <br />
          <em>New possibilities.</em>
        </h1>
        <p>A place for curious minds to find what comes next.</p>
      </div>
      <div className="about-mark">
        <BrandMark size={100} />
      </div>
      <div className="prose">
        <p className="lead">
          The world of AI can feel like a doorway into the unknown. Oraculihub
          exists to help you step through it with confidence.
        </p>
        <p>
          We bring AI education and personalized career coaching into one place,
          with a focus on students and professionals in Sri Lanka. Our aim is
          practical: help you understand new technology, build useful skills,
          and connect what you learn to the future you want.
        </p>
        <h2>Why a shrine?</h2>
        <p>
          For centuries, people have told stories about seeking knowledge,
          discovering purpose, and learning a craft. We’ve borrowed that sense
          of wonder to make the start of your learning journey memorable.
        </p>
        <p>
          The gods in our shrine are creative guides to four pathways. Athena
          represents direction and career clarity. Apollo opens a door to AI
          foundations. Hephaestus invites you to build. Hermes connects new
          skills to everyday work.
        </p>
        <h2>A human journey in an AI age.</h2>
        <p>
          Technology is part of the story. Your interests, choices, and
          ambitions are at its center. Whether you begin with a free lesson or a
          conversation about your career, the next step is yours.
        </p>
        <div className="notice">
          Oraculihub is currently in its preview stage. Courses and prices
          marked as samples are illustrative. Real offerings and service details
          will be published as they become available.
        </div>
        <Link className="button button-gold" href="/courses">
          Find your beginning <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
