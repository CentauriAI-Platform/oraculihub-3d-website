import Link from "next/link";
import { BrandMark } from "./brand";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link href="/" className="brand">
            <BrandMark />
            <span>
              ORACULIHUB<small>WISDOM MEETS POSSIBILITY</small>
            </span>
          </Link>
          <p>
            Ancient inspiration. Modern possibility.
            <br />A new chapter of learning, made for Sri Lanka.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/courses">
            Explore courses <ArrowUpRight size={13} />
          </Link>
          <Link href="/coaching">
            Find your direction <ArrowUpRight size={13} />
          </Link>
          <Link href="/about">
            Our story <ArrowUpRight size={13} />
          </Link>
          <Link href="/dashboard">
            My learning <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="footer-note">
          <span className="eyebrow">YOUR NEXT CHAPTER AWAITS</span>
          <p>
            The future belongs
            <br />
            to the curious.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Oraculihub. All rights reserved.
        </span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <span className="made-in">
            <span /> Made for Sri Lanka
          </span>
        </div>
      </div>
    </footer>
  );
}
