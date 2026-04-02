import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getLocations, postLocation, putLocation, deleteLocation } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';
const btnIcon = 'p-2 rounded-lg transition-colors';

export default function InputLokasi() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nama_lokasi: '', keterangan: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);

  const load = async (p = page, lim = pageSize) => {
    try {
      setLoading(true);
      const res = await getLocations({ page: p, limit: lim });
      const body = res.data;
      if (body.data !== undefined) {
        setList(body.data);
        setTotal(body.total);
        setPage(body.page);
        setTotalPages(body.totalPages);
        return body;
      }
      setList(body);
      setTotal(body.length);
      setTotalPages(1);
      return { data: body, total: body.length };
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ nama_lokasi: '', keterangan: '' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ nama_lokasi: row.nama_lokasi, keterangan: row.keterangan || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_lokasi.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await putLocation(editingId, form);
      } else {
        await postLocation(form);
      }
      setModalOpen(false);
      await load(editingId ? page : 1);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLocation(id);
      setConfirmDelete({ open: false, id: null });
      const result = await load(page);
      if (result?.data?.length === 0 && page > 1) {
        setPage(page - 1);
        load(page - 1);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Input Lokasi Baru</h1>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <Plus className="w-5 h-5" />
          Tambah Lokasi
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Lokasi</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Nama Lokasi</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-6 py-4">{row.nama_lokasi}</td>
                    <td className="px-6 py-4">{row.keterangan || '-'}</td>
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
                          onClick={() => setConfirmDelete({ open: true, id: row.id })}
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
            {list.length === 0 && <p className="p-6 text-slate-500">Belum ada data.</p>}
          </div>
        )}
        {!loading && total > 0 && (
          <Pagination
            page={page}
            limit={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={(p) => { setPage(p); load(p); }}
            onLimitChange={(n) => {
              setPageSize(n);
              load(1, n);
            }}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Lokasi' : 'Tambah Lokasi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lokasi</label>
            <input
              type="text"
              value={form.nama_lokasi}
              onChange={(e) => setForm((f) => ({ ...f, nama_lokasi: e.target.value }))}
              className={inputClass}
              placeholder="Contoh: Gudang Utama"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan</label>
            <textarea
              value={form.keterangan}
              onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
              className={inputClass}
              rows={2}
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

      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Hapus Lokasi"
        message="Yakin ingin menghapus lokasi ini?"
      />
    </div>
  );
}
