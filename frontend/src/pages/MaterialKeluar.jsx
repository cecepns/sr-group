import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getMaterialKeluar, postMaterialKeluar, deleteMaterialKeluar, getMaterials, getLocations } from '../services/api';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';
import SearchableSelect, { toMaterialOptions, toLokasiIdOptions } from '../components/SearchableSelect';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';
const btnIcon = 'p-2 rounded-lg transition-colors';

export default function MaterialKeluar() {
  const [list, setList] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [form, setForm] = useState({
    material_id: '',
    lokasi_id: '',
    lokasi_tujuan_id: '',
    qty: '',
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: '',
  });

  const loadList = async (p = page, lim = pageSize) => {
    try {
      setLoading(true);
      const res = await getMaterialKeluar({ page: p, limit: lim });
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
    (async () => {
      try {
        const [resMat, resLoc] = await Promise.all([getMaterials(), getLocations()]);
        setMaterials(Array.isArray(resMat.data) ? resMat.data : resMat.data?.data ?? []);
        setLocations(Array.isArray(resLoc.data) ? resLoc.data : resLoc.data?.data ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
    loadList(1);
  }, []);

  const openModal = () => {
    setForm({
      material_id: '',
      lokasi_id: '',
      lokasi_tujuan_id: '',
      qty: '',
      tanggal: new Date().toISOString().slice(0, 10),
      keterangan: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.material_id || !form.lokasi_id || !form.qty || !form.tanggal) return;
    setSubmitting(true);
    try {
      await postMaterialKeluar({
        material_id: Number(form.material_id),
        lokasi_id: Number(form.lokasi_id),
        lokasi_tujuan_id: form.lokasi_tujuan_id ? Number(form.lokasi_tujuan_id) : null,
        qty: Number(form.qty),
        tanggal: form.tanggal,
        keterangan: form.keterangan,
      });
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
      await deleteMaterialKeluar(id);
      setConfirmDelete({ open: false, id: null });
      const result = await loadList(page);
      if (result?.data?.length === 0 && page > 1) {
        setPage(page - 1);
        loadList(page - 1);
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Material Keluar</h1>
        <button type="button" onClick={openModal} className={btnPrimary}>
          <Plus className="w-5 h-5" />
          Tambah Material Keluar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Data Material Keluar</h2>
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
                  <th className="px-6 py-4 font-medium">Harga Satuan</th>
                  <th className="px-6 py-4 font-medium">Lokasi Asal</th>
                  <th className="px-6 py-4 font-medium">Lokasi Tujuan</th>
                  <th className="px-6 py-4 font-medium">Qty</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-6 py-4">{row.nama_material} ({row.satuan})</td>
                    <td className="px-6 py-4">
                      {row.harga != null && Number(row.harga) > 0
                        ? `Rp ${Number(row.harga).toLocaleString('id-ID')} / ${row.satuan}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">{row.nama_lokasi_asal || '-'}</td>
                    <td className="px-6 py-4">{row.nama_lokasi_tujuan || '-'}</td>
                    <td className="px-6 py-4">{Number(row.qty).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{formatDate(row.tanggal)}</td>
                    <td className="px-6 py-4">{row.keterangan || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ open: true, id: row.id })}
                        className={`${btnIcon} text-red-600 hover:bg-red-50`}
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            onPageChange={(p) => loadList(p)}
            onLimitChange={(n) => {
              setPageSize(n);
              loadList(1, n);
            }}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Material Keluar" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Material</label>
              <SearchableSelect
                inputId="mk-material"
                aria-label="Pilih material"
                options={toMaterialOptions(materials)}
                value={form.material_id}
                onChange={(v) => setForm((f) => ({ ...f, material_id: v }))}
                placeholder="Ketik atau pilih material..."
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lokasi Asal</label>
              <SearchableSelect
                inputId="mk-lokasi-asal"
                aria-label="Pilih lokasi asal"
                options={toLokasiIdOptions(locations)}
                value={form.lokasi_id}
                onChange={(v) => setForm((f) => ({ ...f, lokasi_id: v }))}
                placeholder="Ketik atau pilih lokasi..."
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lokasi Tujuan (opsional)</label>
              <SearchableSelect
                inputId="mk-lokasi-tujuan"
                aria-label="Pilih lokasi tujuan"
                options={toLokasiIdOptions(locations)}
                value={form.lokasi_tujuan_id}
                onChange={(v) => setForm((f) => ({ ...f, lokasi_tujuan_id: v }))}
                placeholder="Ketik atau pilih lokasi tujuan..."
                isClearable
              />
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
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

      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
        title="Hapus Data"
        message="Yakin ingin menghapus data material keluar ini?"
      />
    </div>
  );
}
