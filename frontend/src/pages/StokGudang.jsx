import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { getStok } from '../services/api';
import Pagination, { PAGINATION_LIMIT } from '../components/Pagination';

export default function StokGudang() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
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
                  <th className="px-6 py-4 font-medium">Total Masuk</th>
                  <th className="px-6 py-4 font-medium">Total Keluar</th>
                  <th className="px-6 py-4 font-medium">Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((row, i) => (
                  <tr key={row.material_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{(page - 1) * limit + i + 1}</td>
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
