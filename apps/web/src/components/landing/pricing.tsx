import { Check } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Get started, taste the simplicity',
    features: [
      '1 project / environment',
      'Up to 5 feature flags',
      'Single API endpoint access',
      'Basic toggle (on/off)',
      'Community support',
      '1,000 API requests/month',
    ],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/mo',
    description: 'For solo devs & small projects',
    features: [
      'Up to 5 projects',
      'Unlimited feature flags',
      'Percentage rollouts',
      'User targeting (ID, attribute, segment)',
      'Scheduling (auto-enable/disable)',
      'Flag history / audit log (30 days)',
      '50,000 API requests/month',
      'Email support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: '/mo',
    description: 'Multiple projects, real collaboration',
    features: [
      'Everything in Pro',
      'Unlimited projects',
      'Multiple environments (dev, staging, prod)',
      'Team members (5 seats included)',
      'Role-based access control',
      'Webhooks for flag changes',
      'Extended audit log (90 days)',
      '500,000 API requests/month',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Built for scale',
    features: [
      'Everything in Team',
      'Unlimited seats',
      'SSO (SAML/OIDC)',
      'Full audit log with export',
      'SLA guarantee',
      'Custom API rate limits',
      'Dedicated support / onboarding',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your current stage of growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 flex flex-col ${
                tier.highlighted
                  ? 'border-2 border-emerald-500 bg-white shadow-lg relative'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{tier.description}</p>

              <div className="flex items-baseline gap-1 mt-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                <span className="text-sm text-gray-500">{tier.period}</span>
              </div>

              <Link
                href={tier.href}
                className={`block text-center rounded-full px-4 py-2.5 text-sm font-medium transition-colors mb-6 ${
                  tier.highlighted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'border border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {tier.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
