import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { getBelanjaMaterial, postBelanjaMaterial, putBelanjaMaterial, deleteBelanjaMaterial, getMaterials } from '../services/api';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';
const btnDanger = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors';
const btnEdit = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors';

export default function BelanjaMaterial() {
  const [list, setList] = useState([]);
  const [materials, setMaterials] = useState([]);
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
    material_id: '',
    qty: '',
    harga: '',
    total: '',
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
  });

  const loadList = async (p = page, search = searchTerm) => {
    try {
      setLoading(true);
      const params = { page: p, limit };
      if (search) params.search = search;
      const res = await getBelanjaMaterial(params);
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
    (async () => {
      try {
        const resMat = await getMaterials();
        setMaterials(Array.isArray(resMat.data) ? resMat.data : resMat.data?.data ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
    loadList(1);
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      loadList(1, value);
    }, 400);
  };

  const qty = form.qty === '' ? 0 : Number(form.qty);
  const harga = form.harga === '' ? 0 : Number(form.harga);
  const totalAuto = qty * harga;

  const openModal = (row = null) => {
    if (row) {
      setEditId(row.id);
      setForm({
        material_id: String(row.material_id),
        qty: String(row.qty),
        harga: String(row.harga),
        total: String(row.total),
        tanggal: row.tanggal ? row.tanggal.slice(0, 10) : new Date().toISOString().slice(0, 10),
        keterangan: row.keterangan || '',
      });
    } else {
      setEditId(null);
      setForm({
        material_id: '',
        qty: '',
        harga: '',
        total: '',
        tanggal: new Date().toISOString().slice(0, 10),
        keterangan: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.material_id || !form.qty || !form.tanggal) return;
    const total = totalAuto;
    setSubmitting(true);
    try {
      const payload = {
        material_id: Number(form.material_id),
        qty: Number(form.qty),
        harga: Number(form.harga),
        total,
        tanggal: form.tanggal,
        keterangan: form.keterangan,
      };
      if (editId) {
        await putBelanjaMaterial(editId, payload);
      } else {
        await postBelanjaMaterial(payload);
      }
      setModalOpen(false);
      await loadList(page);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBelanjaMaterial(id);
      setDeleteConfirm(null);
      await loadList(page);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Belanja Material</h1>
        <button type="button" onClick={() => openModal()} className={btnPrimary}>
          <Plus className="w-5 h-5" />
          Tambah Belanja Material
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Belanja Material</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari material..."
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
                  <th className="px-6 py-4 font-medium">Material</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Harga</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * limit + i + 1}</td>
                    <td className="px-6 py-4">{row.nama_material} ({row.satuan})</td>
                    <td className="px-6 py-4">{Number(row.qty).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{formatRupiah(row.harga)}</td>
                    <td className="px-6 py-4">{formatRupiah(row.total)}</td>
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
            onPageChange={(p) => loadList(p)}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Belanja Material' : 'Tambah Belanja Material'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Material</label>
              <select
                value={form.material_id}
                onChange={(e) => setForm((f) => ({ ...f, material_id: e.target.value }))}
                className={inputClass}
                required
              >
                <option value="">Pilih Material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama_material} ({m.satuan})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Qty</label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.qty}
                onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Harga</label>
              <input
                type="number"
                min="0"
                value={form.harga}
                onChange={(e) => setForm((f) => ({ ...f, harga: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Total (auto)</label>
              <input
                type="text"
                readOnly
                value={totalAuto > 0 ? formatRupiah(totalAuto) : ''}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-600"
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
