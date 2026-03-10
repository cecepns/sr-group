import { useEffect, useState, useRef } from 'react';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { getStok, putMaterial, deleteMaterial } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';
const btnIcon = 'p-2 rounded-lg transition-colors';

export default function StokGudang() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, name: '' });
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState({ nama_material: '', satuan: '' });
  const limit = PAGINATION_LIMIT;
  const searchTimeout = useRef(null);

  const load = async (p = page, search = searchTerm) => {
    try {
      setLoading(true);
      const params = { page: p, limit };
      if (search) params.search = search;
      const res = await getStok(params);
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

  const openEdit = (row) => {
    setEditingRow(row);
    setForm({ nama_material: row.nama_material, satuan: row.satuan });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_material.trim() || !form.satuan.trim() || !editingRow) return;
    setSubmitting(true);
    try {
      await putMaterial(editingRow.material_id, {
        nama_material: form.nama_material.trim(),
        satuan: form.satuan.trim(),
      });
      setModalOpen(false);
      await load(page, searchTerm);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMaterial(id);
      setConfirmDelete({ open: false, id: null, name: '' });
      const currentList = list.filter((r) => r.material_id !== id);
      if (currentList.length === 0 && page > 1) {
        load(page - 1, searchTerm);
      } else {
        load(page, searchTerm);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Stok Gudang</h1>
      <p className="text-slate-600 mb-6">Stok = Total Masuk − Total Keluar (agregasi per material)</p>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Stok</h2>
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
                  <th className="px-6 py-4 font-medium">Satuan</th>
                  <th className="px-6 py-4 font-medium">Harga Satuan</th>
                  <th className="px-6 py-4 font-medium">Total Masuk</th>
                  <th className="px-6 py-4 font-medium">Total Keluar</th>
                  <th className="px-6 py-4 font-medium">Stok</th>
                  <th className="px-6 py-4 font-medium w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.material_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * limit + i + 1}</td>
                    <td className="px-6 py-4">{row.nama_material}</td>
                    <td className="px-6 py-4">{row.satuan}</td>
                    <td className="px-6 py-4">
                      {row.harga != null && Number(row.harga) > 0
                        ? `Rp ${Number(row.harga).toLocaleString('id-ID')} / ${row.satuan}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">{Number(row.total_masuk).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{Number(row.total_keluar).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 font-semibold">{Number(row.stok).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className={`${btnIcon} text-slate-600 hover:bg-slate-200 hover:text-slate-800`}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete({ open: true, id: row.material_id, name: row.nama_material })}
                          className={`${btnIcon} text-red-600 hover:bg-red-50`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="p-6 text-slate-500">Belum ada data material / transaksi.</p>}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Material">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Material</label>
            <input
              type="text"
              value={form.nama_material}
              onChange={(e) => setForm((f) => ({ ...f, nama_material: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Satuan</label>
            <input
              type="text"
              value={form.satuan}
              onChange={(e) => setForm((f) => ({ ...f, satuan: e.target.value }))}
              className={inputClass}
              required
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

      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, name: '' })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Hapus Material"
        message={`Yakin ingin menghapus material "${confirmDelete.name}"? Semua data transaksi masuk/keluar terkait juga akan terpengaruh.`}
      />
    </div>
  );
}
