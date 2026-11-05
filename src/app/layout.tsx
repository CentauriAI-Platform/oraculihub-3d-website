import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Oraculihub — Ancient wisdom. Future intelligence.",
    template: "%s · Oraculihub",
  },
  description:
    "Discover your path through AI education and personalized career coaching. A new age of learning for curious minds in Sri Lanka.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
