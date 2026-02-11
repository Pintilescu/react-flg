import Link from 'next/link';

export function CTA() {
  return (
    <section className="relative py-24 md:py-32 border-t border-slate-800/50 overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(99,102,241,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Start shipping with confidence
        </h2>
        <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
          Free tier available. No credit card required.
        </p>
        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-block rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
