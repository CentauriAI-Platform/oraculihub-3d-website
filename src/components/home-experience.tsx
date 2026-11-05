"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, Component, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Sparkles,
  BookOpen,
  MoveDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PathwayCards } from "./pathway-card";
import { ScenePathwayLabels } from "./scene-pathway-labels";
const Shrine = dynamic(() => import("./temple-scene"), {
  ssr: false,
  loading: () => null,
});
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function HomeExperience() {
  const section = useRef<HTMLDivElement>(null),
    [progress, setProgress] = useState(0),
    [enabled, setEnabled] = useState(false),
    [reduced, setReduced] = useState(false),
    [sound, setSound] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const listener = () => setReduced(media.matches);
    media.addEventListener("change", listener);
    const canvas = document.createElement("canvas");
    try {
      setEnabled(
        innerWidth >= 700 &&
          !!(canvas.getContext("webgl2") || canvas.getContext("webgl")),
      );
    } catch {
      setEnabled(false);
    }
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (section.current) {
          const rect = section.current.getBoundingClientRect();
          setProgress(
            rect.height - innerHeight > 1
              ? Math.max(
                  0,
                  Math.min(1, -rect.top / (rect.height - innerHeight)),
                )
              : 0,
          );
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      media.removeEventListener("change", listener);
      cancelAnimationFrame(frame);
      audio.current?.close();
    };
  }, []);
  function enter() {
    if (reduced || !enabled || innerWidth < 700) {
      document
        .querySelector("#pathways")
        ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
      return;
    }
    if (section.current)
      window.scrollTo({
        top:
          section.current.offsetTop +
          (section.current.offsetHeight - innerHeight) * 0.91,
        behavior: "smooth",
      });
  }
  function toggleSound() {
    if (sound) {
      audio.current?.suspend();
      setSound(false);
      return;
    }
    if (!audio.current) {
      const ctx = new AudioContext();
      audio.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0.018;
      gain.connect(ctx.destination);
      [55, 82.4, 110].forEach((f) => {
        const osc = ctx.createOscillator();
        osc.frequency.value = f;
        osc.type = "sine";
        osc.connect(gain);
        osc.start();
      });
    }
    audio.current.resume();
    setSound(true);
  }
  return (
    <>
      <section
        className={`entrance-sequence ${reduced || !enabled ? "reduced" : ""}`}
        ref={section}
      >
        <div className="entrance-sticky">
          <div
            className="shrine-background"
            style={{
              opacity: Math.max(0, 1 - progress * 3),
              transform: `scale(${1 + progress * 0.16})`,
            }}
          >
            <Image
              src="/images/shrine.webp"
              alt="Monumental bronze doors of an ancient firelit Greek shrine"
              fill
              priority
              sizes="100vw"
            />
          </div>
          {enabled && !reduced && (
            <div
              className="shrine-canvas"
              style={{ opacity: Math.min(1, progress * 5) }}
            >
              <SceneBoundary
                onFailure={() => {
                  setEnabled(false);
                  setProgress(0);
                }}
              >
                <Shrine progress={progress} />
              </SceneBoundary>
            </div>
          )}
          <div className="hero-shade" style={{ opacity: 1 - progress * 0.6 }} />
          <div
            className="hero-copy"
            inert={progress > 0.3 && enabled && !reduced}
            style={{
              opacity: Math.max(0, 1 - progress * 4),
              transform: `translateY(${-progress * 100}px)`,
              pointerEvents: progress > 0.3 ? "none" : "auto",
            }}
          >
            <div className="eyebrow hero-eyebrow">
              <span /> AN ANCIENT STORY. A NEW BEGINNING. <span />
            </div>
            <h1>
              Ancient wisdom.
              <br />
              <em>Future intelligence.</em>
            </h1>
            <p>
              Beyond these doors, a new version of you awaits.
              <br />
              Discover AI. Find your purpose. Shape what comes next.
            </p>
            <div className="hero-buttons">
              <button className="button button-gold" onClick={enter}>
                Enter the shrine <ArrowRight size={17} />
              </button>
              <a className="hero-secondary" href="#pathways">
                Discover your path <ArrowUpRight size={16} />
              </a>
            </div>
            <span className="hero-micro">
              AI EDUCATION & PERSONALIZED CAREER COACHING
            </span>
          </div>
          <div
            className="inside-caption"
            inert={progress <= 0.6 || !enabled || reduced}
            aria-hidden={progress <= 0.6 || !enabled || reduced}
            style={{
              opacity: progress > 0.6 ? Math.min(1, (progress - 0.6) * 4) : 0,
              pointerEvents: progress > 0.65 ? "auto" : "none",
            }}
          >
            <span className="eyebrow">THE SHRINE OF POSSIBILITY</span>
            <h2>
              Four guides.
              <br />
              <em>Infinite possibilities.</em>
            </h2>
            <a className="button button-outline" href="#pathways">
              Choose your path <ArrowDown size={16} />
            </a>
          </div>
          <ScenePathwayLabels
            visible={progress > 0.68 && enabled && !reduced}
          />
          <div className="hero-bottom">
            <span className="hero-location">
              <span /> MADE FOR SRI LANKA. OPEN TO POSSIBILITY.
            </span>
            <button className="scroll-cue" onClick={enter}>
              <span>SCROLL TO DISCOVER</span>
              <MoveDown size={21} />
            </button>
            <button
              className="sound-button"
              onClick={toggleSound}
              aria-label={sound ? "Mute ambience" : "Enable ambience"}
            >
              {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>SOUND {sound ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </section>
      <div className="wisdom-strip">
        <span>FOR THE CURIOUS.</span>
        <span className="little-star">✦</span>
        <span>FOR THE AMBITIOUS.</span>
        <span className="little-star">✦</span>
        <span>FOR WHAT COMES NEXT.</span>
      </div>
      <section id="pathways" className="section pathways-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span className="gold-line" /> THE HALL OF PATHWAYS
            </span>
            <h2>
              Every journey begins
              <br />
              with <em>a choice.</em>
            </h2>
          </div>
          <p>
            Four guides. Four paths to possibility.
            <br />
            Choose the one that speaks to where you
            <br className="desktop-break" /> are — and where you want to go.
          </p>
        </div>
        <PathwayCards />
        <div className="pathways-caption">
          <span>
            <Compass size={15} /> Not sure where to begin?
          </span>
          <Link href="/coaching">
            Let’s find your direction together <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
      <section className="section learning-story">
        <div className="story-emblem">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span>✦</span>
          <i className="orbit-dot" />
        </div>
        <div className="story-copy">
          <span className="eyebrow">OLD SOUL. FUTURE MIND.</span>
          <h2>
            The world is changing.
            <br />
            <em>So can you.</em>
          </h2>
          <p>
            You don’t need to have it all figured out. Just the curiosity to
            begin. Oraculihub brings practical AI learning and personal career
            guidance together, so your next step feels a little clearer.
          </p>
          <Link href="/about" className="text-link">
            The story behind the shrine <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section steps-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR JOURNEY, YOUR PACE</span>
            <h2>
              A little curiosity.
              <br />
              <em>A whole new chapter.</em>
            </h2>
          </div>
          <Link href="/courses" className="button button-outline">
            Explore all courses <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="steps-grid">
          {[
            {
              icon: Compass,
              n: "01",
              title: "Find your path",
              text: "Explore a world of possibilities and find the direction that feels right for you.",
            },
            {
              icon: BookOpen,
              n: "02",
              title: "Learn by doing",
              text: "Turn new knowledge into useful skills, one practical lesson and project at a time.",
            },
            {
              icon: Sparkles,
              n: "03",
              title: "Become what’s next",
              text: "Bring your skills into the real world, with personal guidance when you need it.",
            },
          ].map((s) => (
            <div className="step" key={s.n}>
              <div className="step-top">
                <s.icon size={25} strokeWidth={1} />
                <span>{s.n}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="final-invitation">
        <span className="eyebrow">THE DOOR IS OPEN</span>
        <h2>
          Your next chapter
          <br />
          <em>starts with you.</em>
        </h2>
        <Link className="button button-gold" href="/courses">
          Find your beginning <ArrowRight size={17} />
        </Link>
        <p>A little ancient wisdom. A world of new possibilities.</p>
      </section>
    </>
  );
}
