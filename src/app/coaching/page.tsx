import Image from "next/image";
import { Compass, Map, MessagesSquare } from "lucide-react";
import { CoachingForm } from "@/components/coaching-form";
export const metadata = { title: "Personal career coaching" };
export default function Coaching() {
  return (
    <>
      <section className="page-shell coaching-hero">
        <div>
          <span className="eyebrow">ATHENA · CAREER & PURPOSE</span>
          <h1>
            You don’t have to
            <br />
            <em>figure it out alone.</em>
          </h1>
          <p className="lead">
            A little perspective. A clearer direction.
            <br />
            Personal guidance for your next career chapter.
          </p>
          <a className="button button-gold" href="#consultation">
            Find your next step →
          </a>
        </div>
        <div className="coaching-portrait">
          <Image
            src="/images/athena.webp"
            alt="Athena, your symbolic guide to career and purpose"
            fill
            priority
            sizes="(max-width:700px) 100vw, 40vw"
          />
        </div>
      </section>
      <section className="section coaching-content">
        <div>
          <span className="eyebrow">A PATH THAT BELONGS TO YOU</span>
          <h2>
            Not every journey
            <br />
            follows <em>a straight line.</em>
          </h2>
          <p>
            Whether you’re choosing your first direction, growing in your
            profession, or considering a change, coaching gives you space to
            think and a practical way forward.
          </p>
          <div className="coaching-steps">
            {[
              {
                icon: MessagesSquare,
                title: "Start with your story",
                text: "Talk about your interests, experience, and the questions on your mind.",
              },
              {
                icon: Compass,
                title: "Explore your possibilities",
                text: "Connect your strengths to potential roles and the skills they call for.",
              },
              {
                icon: Map,
                title: "Leave with a next step",
                text: "Build a personal action plan, from learning priorities to CV and interview preparation.",
              },
            ].map((s) => (
              <div key={s.title}>
                <s.icon size={22} strokeWidth={1.2} />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <CoachingForm />
      </section>
    </>
  );
}
