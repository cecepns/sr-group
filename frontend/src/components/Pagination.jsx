import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_LIMIT = 10;

export const PAGE_SIZE_OPTIONS = [10, 50, 100];

export default function Pagination({
  page,
  limit = DEFAULT_LIMIT,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  limitOptions = PAGE_SIZE_OPTIONS,
}) {
  if (total <= 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const showNav = totalPages > 1;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <p className="text-sm text-slate-600">
          Menampilkan <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> dari{' '}
          <span className="font-medium">{total}</span> data
        </p>
        {onLimitChange && (
          <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
            <span>Baris per halaman</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {showNav && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-700 whitespace-nowrap">
            Halaman {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_LIMIT as PAGINATION_LIMIT };
