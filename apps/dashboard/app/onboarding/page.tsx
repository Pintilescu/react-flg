'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type OnboardingData = {
  orgName: string;
  projectName: string;
  projectDescription: string;
  inviteEmails: string;
};

const onboardingSteps = ['Organization', 'First Project', 'Invite Team'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    orgName: '',
    projectName: '',
    projectDescription: '',
    inviteEmails: '',
  });

  function updateField(field: keyof OnboardingData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Onboarding failed');

      router.push('/dashboard');
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          {onboardingSteps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              {i < onboardingSteps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Name your organization</h2>
              <p className="text-sm text-gray-500 mt-1">This is your team or company name.</p>
              <input
                type="text"
                value={data.orgName}
                onChange={(e) => updateField('orgName', e.target.value)}
                placeholder="Acme Inc."
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create your first project</h2>
              <p className="text-sm text-gray-500 mt-1">A project groups your feature flags.</p>
              <input
                type="text"
                value={data.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                placeholder="My App"
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <textarea
                value={data.projectDescription}
                onChange={(e) => updateField('projectDescription', e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Invite your team</h2>
              <p className="text-sm text-gray-500 mt-1">
                Comma-separated emails. You can skip this.
              </p>
              <textarea
                value={data.inviteEmails}
                onChange={(e) => updateField('inviteEmails', e.target.value)}
                placeholder="alice@acme.com, bob@acme.com"
                rows={3}
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && !data.orgName.trim()) || (step === 1 && !data.projectName.trim())
                }
                className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>

        {step === 2 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-500 mt-3"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
