import { DocsPreview } from '@/components/landing/docs-preview';
import { Features } from '@/components/landing/features';
import { Footer } from '@/components/landing/footer';
import { Hero } from '@/components/landing/hero';
import { Navbar } from '@/components/landing/navbar';
import { Pricing } from '@/components/landing/pricing';

export default function Home() {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <DocsPreview />
      </main>
      <Footer />
    </div>
  );
}
