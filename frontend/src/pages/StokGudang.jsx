import { useEffect, useState } from 'react';
import { getStok } from '../services/api';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

export default function StokGudang() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = PAGINATION_LIMIT;

  const load = async (p = page) => {
    try {
      setLoading(true);
      const res = await getStok({ page: p, limit });
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Stok Gudang</h1>
      <p className="text-slate-600 mb-6">Stok = Total Masuk − Total Keluar (agregasi per material)</p>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Daftar Stok</h2>
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
                  <th className="px-6 py-4 font-medium">Total Masuk</th>
                  <th className="px-6 py-4 font-medium">Total Keluar</th>
                  <th className="px-6 py-4 font-medium">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.material_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4">{row.nama_material}</td>
                    <td className="px-6 py-4">{row.satuan}</td>
                    <td className="px-6 py-4">{Number(row.total_masuk).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">{Number(row.total_keluar).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 font-semibold">{Number(row.stok).toLocaleString('id-ID')}</td>
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
    </div>
  );
}
