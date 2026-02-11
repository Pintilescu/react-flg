'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

type Props = {
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  totalCount: number;
};

export function Pagination({ currentPage, totalPages, from, to, totalCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between text-sm px-6 py-4 border-t border-gray-100">
      <span className="text-gray-400">
        Showing {from} to {to} of {totalCount} flags
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
        >
          &lsaquo;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-emerald-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  );
}
