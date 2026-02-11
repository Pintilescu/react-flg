import { AlertTriangle, Info, Lightbulb, XCircle } from 'lucide-react';

type CalloutType = 'tip' | 'info' | 'warning' | 'danger';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const config: Record<CalloutType, { icon: React.ElementType; bg: string; border: string; title: string; titleColor: string }> = {
  tip: {
    icon: Lightbulb,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'Tip',
    titleColor: 'text-emerald-700',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'Info',
    titleColor: 'text-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'Warning',
    titleColor: 'text-amber-700',
  },
  danger: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'Danger',
    titleColor: 'text-red-700',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`rounded-lg border ${c.border} ${c.bg} p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${c.titleColor} mt-0.5 shrink-0`} />
        <div>
          <p className={`text-sm font-semibold ${c.titleColor} mb-1`}>{title ?? c.title}</p>
          <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
