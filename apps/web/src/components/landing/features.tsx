import { ToggleRight, Users, ScrollText, Zap } from 'lucide-react';

const capabilities = [
  {
    icon: ToggleRight,
    title: 'Real-time toggles',
    description:
      'Update flags instantly across your entire infrastructure in milliseconds without redeploying code.',
  },
  {
    icon: Users,
    title: 'User targeting',
    description:
      'Target specific user segments based on geography, device, or custom attributes with granular rules.',
  },
  {
    icon: ScrollText,
    title: 'Audit logs',
    description:
      'Track every flag change with full history. Know who changed what and when for compliance and debugging.',
  },
  {
    icon: Zap,
    title: 'Fast evaluation',
    description:
      'Lightning-fast flag evaluation using HTTP caching with ETags. Your app gets instant responses with zero unnecessary network overhead.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">
            Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Engineered for speed and scale
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage feature lifecycles without bloating your codebase or impacting performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {capabilities.map((cap) => (
            <div key={cap.title} className="text-left">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <cap.icon className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{cap.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
