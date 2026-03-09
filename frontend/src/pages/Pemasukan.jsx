import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { getPemasukan, postPemasukan } from '../services/api';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';

export default function Pemasukan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = PAGINATION_LIMIT;
  const [form, setForm] = useState({
    nama_pemasukan: '',
    jumlah: '',
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
  });

  const load = async (p = page) => {
    try {
      setLoading(true);
      const res = await getPemasukan({ page: p, limit });
      const body = res.data;
      if (body.data !== undefined) {
        setList(body.data);
        setTotal(body.total);
        setPage(body.page);
        setTotalPages(body.totalPages);
      } else {
        setList(body);
        setTotal(body.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const openModal = () => {
    setForm({
      nama_pemasukan: '',
      jumlah: '',
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_pemasukan.trim() || !form.jumlah) return;
    setSubmitting(true);
    try {
      await postPemasukan({
        nama_pemasukan: form.nama_pemasukan,
        jumlah: Number(form.jumlah),
        tanggal: form.tanggal,
        keterangan: form.keterangan,
      });
      setModalOpen(false);
      await load(page);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pemasukan</h1>
        <button type="button" onClick={openModal} className={btnPrimary}>
          <Plus className="w-5 h-5" />
          Tambah Pemasukan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Pemasukan</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Nama Pemasukan</th>
                  <th className="px-6 py-4 font-medium">Jumlah</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4">{row.nama_pemasukan}</td>
                    <td className="px-6 py-4">{formatRupiah(row.jumlah)}</td>
                    <td className="px-6 py-4">{formatDate(row.tanggal)}</td>
                    <td className="px-6 py-4">{row.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="p-6 text-slate-500">Belum ada data.</p>}
          </div>
        )}
        {!loading && total > 0 && (
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={(p) => load(p)}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Pemasukan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Pemasukan</label>
            <input
              type="text"
              value={form.nama_pemasukan}
              onChange={(e) => setForm((f) => ({ ...f, nama_pemasukan: e.target.value }))}
              className={inputClass}
              placeholder="Contoh: DP Proyek A"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah</label>
            <input
              type="number"
              min="0"
              value={form.jumlah}
              onChange={(e) => setForm((f) => ({ ...f, jumlah: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan</label>
            <input
              type="text"
              value={form.keterangan}
              onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
              className={inputClass}
              placeholder="Opsional"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={submitting} className={btnPrimary}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
