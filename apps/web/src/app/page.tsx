import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import {
  PlacementProcess,
  Companies,
  SuccessStories,
  RoadmapPreview,
  Pricing,
  FAQ,
  Footer,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Companies />
      <Features />
      <PlacementProcess />
      <RoadmapPreview />
      <SuccessStories />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
