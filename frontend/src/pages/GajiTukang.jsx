import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getGaji, postGaji, putGaji, deleteGaji } from '../services/api';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';
const btnDanger = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors';
const btnEdit = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors';

export default function GajiTukang() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = PAGINATION_LIMIT;
  const searchTimeout = useRef(null);
  const [form, setForm] = useState({
    nama_tukang: '',
    jumlah: '',
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
    lokasi: '',
  });

  const load = async (p = page, search = searchTerm) => {
    try {
      setLoading(true);
      const params = { page: p, limit };
      if (search) params.search = search;
      const res = await getGaji(params);
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

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      load(1, value);
    }, 400);
  };

  const openModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setForm({
        nama_tukang: row.nama_tukang,
        jumlah: String(row.jumlah),
        tanggal: row.tanggal ? row.tanggal.slice(0, 10) : new Date().toISOString().slice(0, 10),
        keterangan: row.keterangan || '',
        lokasi: row.lokasi || '',
      });
    } else {
      setEditId(null);
      setForm({
        nama_tukang: '',
        jumlah: '',
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: '',
        lokasi: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_tukang.trim() || !form.jumlah) return;
    setSubmitting(true);
    try {
      const payload = {
        nama_tukang: form.nama_tukang,
        jumlah: Number(form.jumlah),
        tanggal: form.tanggal,
        keterangan: form.keterangan,
        lokasi: form.lokasi,
      };
      if (editId) {
        await putGaji(editId, payload);
      } else {
        await postGaji(payload);
      }
      setModalOpen(false);
      await load(page);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGaji(id);
      setDeleteConfirm(null);
      await load(page);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gaji Tukang</h1>
        <button type="button" onClick={() => openModal()} className={btnPrimary}>
          <Plus className="w-5 h-5" />
          Tambah Gaji Tukang
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Gaji Tukang</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari gaji tukang..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
          </div>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Nama Tukang</th>
                  <th className="px-6 py-4 font-medium">Jumlah</th>
                  <th className="px-6 py-4 font-medium">Lokasi</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * limit + i + 1}</td>
                    <td className="px-6 py-4">{row.nama_tukang}</td>
                    <td className="px-6 py-4">{formatRupiah(row.jumlah)}</td>
                    <td className="px-6 py-4">{row.lokasi || '-'}</td>
                    <td className="px-6 py-4">{formatDate(row.tanggal)}</td>
                    <td className="px-6 py-4">{row.keterangan || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => openModal(row)} className={btnEdit} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm(row.id)} className={btnDanger} title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Gaji Tukang' : 'Tambah Gaji Tukang'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Tukang</label>
            <input
              type="text"
              value={form.nama_tukang}
              onChange={(e) => setForm((f) => ({ ...f, nama_tukang: e.target.value }))}
              className={inputClass}
              placeholder="Contoh: Budi"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Lokasi</label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
              className={inputClass}
              placeholder="Contoh: Proyek A"
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

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setDeleteConfirm(null)} className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">
            Batal
          </button>
          <button type="button" onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
