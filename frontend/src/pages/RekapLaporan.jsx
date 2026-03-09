import { useEffect, useState } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { getRekap } from '../services/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function exportExcel(data, startDate, endDate) {
  const period = startDate && endDate ? `Periode ${startDate} s/d ${endDate}` : 'Semua Periode';
  const rows = [
    ['Rekap Laporan Kas'],
    [period],
    [],
    ['Keterangan', 'Jumlah'],
    ['Total Pemasukan', formatRupiah(data.total_pemasukan)],
    ['Total Pengeluaran Kantor', formatRupiah(data.total_pengeluaran)],
    ['Total Gaji Tukang', formatRupiah(data.total_gaji)],
    ['Total Belanja Material', formatRupiah(data.total_belanja_material)],
    ['Saldo Kas', formatRupiah(data.saldo_kas)],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Laporan');
  XLSX.writeFile(wb, `Rekap_Laporan_${startDate || 'all'}_${endDate || 'all'}.xlsx`);
}

function exportPdf(data, startDate, endDate) {
  const period = startDate && endDate ? `Periode ${startDate} s/d ${endDate}` : 'Semua Periode';
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Rekap Laporan Kas', 14, 20);
  doc.setFontSize(10);
  doc.text(period, 14, 28);
  autoTable(doc, {
    startY: 34,
    head: [['Keterangan', 'Jumlah']],
    body: [
      ['Total Pemasukan', formatRupiah(data.total_pemasukan)],
      ['Total Pengeluaran Kantor', formatRupiah(data.total_pengeluaran)],
      ['Total Gaji Tukang', formatRupiah(data.total_gaji)],
      ['Total Belanja Material', formatRupiah(data.total_belanja_material)],
      ['Saldo Kas', formatRupiah(data.saldo_kas)],
    ],
  });
  doc.save(`Rekap_Laporan_${startDate || 'all'}_${endDate || 'all'}.pdf`);
}

export default function RekapLaporan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await getRekap(Object.keys(params).length ? params : undefined);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    load();
  };

  if (error && !data) return <div className="text-red-600">Error: {error}</div>;
  if (!data && loading) return <div className="text-slate-600">Memuat...</div>;

  const items = data
    ? [
        { label: 'Total Pemasukan', value: data.total_pemasukan },
        { label: 'Total Pengeluaran Kantor', value: data.total_pengeluaran },
        { label: 'Total Gaji Tukang', value: data.total_gaji },
        { label: 'Total Belanja Material', value: data.total_belanja_material },
        { label: 'Saldo Kas', value: data.saldo_kas, highlight: true },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Rekap Laporan</h1>
      <p className="text-slate-600 mb-6">
        Saldo Kas = Pemasukan − Pengeluaran Kantor − Gaji Tukang − Belanja Material
      </p>

      <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Periode Laporan</h2>
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800"
          >
            Terapkan
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => data && exportExcel(data, startDate || null, endDate || null)}
              disabled={!data}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => data && exportPdf(data, startDate || null, endDate || null)}
              disabled={!data}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-600 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <FileDown className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden max-w-2xl">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Ringkasan Kas</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Memuat...</p>
        ) : (
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr
                  key={item.label}
                  className={item.highlight ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}
                >
                  <td className="px-6 py-4">{item.label}</td>
                  <td
                    className={`px-6 py-4 text-right ${item.highlight && item.value < 0 ? 'text-red-600' : ''}`}
                  >
                    {formatRupiah(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
