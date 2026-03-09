import { useEffect, useState } from 'react';
import { Wallet, Building2, Users, ShoppingCart, Package, Warehouse } from 'lucide-react';
import { getDashboard } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-slate-600">Memuat...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return null;

  const cards = [
    { label: 'Total Pemasukan', value: data.total_pemasukan, color: 'bg-emerald-500', format: 'currency', icon: Wallet },
    { label: 'Total Pengeluaran Kantor', value: data.total_pengeluaran, color: 'bg-rose-500', format: 'currency', icon: Building2 },
    { label: 'Total Gaji Tukang', value: data.total_gaji, color: 'bg-amber-500', format: 'currency', icon: Users },
    { label: 'Total Belanja Material', value: data.total_belanja_material, color: 'bg-violet-500', format: 'currency', icon: ShoppingCart },
    { label: 'Jumlah Jenis Material', value: data.jumlah_material, color: 'bg-sky-500', format: 'number', icon: Package },
    { label: 'Total Item Stok', value: data.total_item_stok, color: 'bg-teal-500', format: 'number', icon: Warehouse },
  ];

  const formatVal = (val, format) => {
    if (format === 'currency') return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    return Number(val).toLocaleString('id-ID');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.color} text-white rounded-2xl p-5 shadow-lg border border-white/10 flex flex-col`}>
              <div className="flex items-start justify-between">
                <p className="text-sm opacity-90">{card.label}</p>
                <Icon className="w-8 h-8 opacity-80 shrink-0" />
              </div>
              <p className="text-xl font-bold mt-2">{formatVal(card.value, card.format)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
