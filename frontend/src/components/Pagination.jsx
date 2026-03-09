import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_LIMIT = 10;

export default function Pagination({ page, limit = DEFAULT_LIMIT, total, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
      <p className="text-sm text-slate-600">
        Menampilkan <span className="font-medium">{start}</span>–<span className="font-medium">{end}</span> dari <span className="font-medium">{total}</span> data
      </p>
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
        <span className="px-3 py-1.5 text-sm text-slate-700">
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
    </div>
  );
}

export { DEFAULT_LIMIT as PAGINATION_LIMIT };
