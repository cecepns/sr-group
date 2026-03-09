import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { deleteUser, getUsers, postUser, putUser } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

const inputClass = 'w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-slate-500 focus:border-slate-500';
const btnPrimary = 'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors';
const btnIcon = 'p-2 rounded-lg transition-colors';

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_GUDANG: 'Admin Gudang',
  ADMIN_KANTOR: 'Admin Kantor',
};

export default function UserManagement() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [form, setForm] = useState({ username: '', password: '', role: 'SUPER_ADMIN' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ username: '', password: '', role: 'SUPER_ADMIN' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ username: row.username, password: '', role: row.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || (!editingId && !form.password) || !form.role) return;
    setSubmitting(true);
    try {
      const payload = {
        username: form.username,
        role: form.role,
      };
      if (form.password) {
        payload.password = form.password;
      }
      if (editingId) {
        await putUser(editingId, payload);
      } else {
        await postUser({ ...payload, password: form.password });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setConfirmDelete({ open: false, id: null });
      await load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <Plus className="w-5 h-5" />
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Daftar User</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500">Memuat...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">No</th>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Dibuat</th>
                  <th className="px-6 py-4 font-medium w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4">{row.username}</td>
                    <td className="px-6 py-4">{ROLE_LABEL[row.role] || row.role}</td>
                    <td className="px-6 py-4">
                      {row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'}
                    </td>
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
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit User' : 'Tambah User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
              {editingId && <span className="text-xs text-slate-500 ml-1">(kosongkan jika tidak diganti)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={inputClass}
              required={!editingId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={inputClass}
              required
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN_GUDANG">Admin Gudang</option>
              <option value="ADMIN_KANTOR">Admin Kantor</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
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
        title="Hapus User"
        message="Yakin ingin menghapus user ini?"
      />
    </div>
  );
}

