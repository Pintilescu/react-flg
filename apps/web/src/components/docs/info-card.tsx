import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InfoCardProps {
  title: string;
  description: string;
  href: string;
}

export function InfoCard({ title, description, href }: InfoCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-gray-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
            {title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
      </div>
    </Link>
  );
}
