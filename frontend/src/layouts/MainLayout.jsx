import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MapPin,
  LogIn,
  LogOut,
  Warehouse,
  Building2,
  Users,
  Wallet,
  ShoppingCart,
  FileText,
  Menu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.jpeg';

const BASE_MENU = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN_GUDANG', 'ADMIN_KANTOR'] },
  { path: '/input-material', label: 'Input Material', icon: Package, roles: ['SUPER_ADMIN'] },
  { path: '/input-lokasi', label: 'Input Lokasi', icon: MapPin, roles: ['SUPER_ADMIN'] },
  { path: '/material-masuk', label: 'Material Masuk', icon: LogIn, roles: ['SUPER_ADMIN', 'ADMIN_GUDANG'] },
  { path: '/material-keluar', label: 'Material Keluar', icon: LogOut, roles: ['SUPER_ADMIN', 'ADMIN_GUDANG'] },
  { path: '/stok-gudang', label: 'Stok Gudang', icon: Warehouse, roles: ['SUPER_ADMIN', 'ADMIN_GUDANG'] },
  { path: '/pengeluaran-kantor', label: 'Pengeluaran Kantor', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN_KANTOR'] },
  { path: '/gaji-tukang', label: 'Gaji Tukang', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN_KANTOR'] },
  { path: '/pemasukan', label: 'Pemasukan', icon: Wallet, roles: ['SUPER_ADMIN', 'ADMIN_KANTOR'] },
  { path: '/belanja-material', label: 'Belanja Material', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN_KANTOR'] },
  { path: '/rekap-laporan', label: 'Rekap Laporan', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN_KANTOR'] },
  { path: '/users', label: 'Manajemen User', icon: Users, roles: ['SUPER_ADMIN'] },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, logout } = useAuth();

  const menuItems = BASE_MENU.filter((item) => !item.roles || !role || item.roles.includes(role));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="fixed top-0 left-0 right-0 h-14 bg-slate-800 text-white shadow-lg z-30 flex items-center px-4">
        <button
          type="button"
          className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold ml-2 md:ml-0 flex-1">Sistem Kas & Stok Material</h1>
        {user && (
          <div className="hidden md:flex items-center gap-3 text-sm">
            <span className="text-slate-200">
              {user.username} ({role?.replace('_', ' ')})
            </span>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs"
            >
              Keluar
            </button>
          </div>
        )}
      </header>

      <aside
        className={`fixed top-14 left-0 bottom-0 w-64 bg-slate-800 text-white shadow-xl z-20 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3 shrink-0">
            <img
              src={logo}
              alt="SR Group"
              className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">SR GROUP</span>
              <span className="text-[11px] text-slate-300 leading-tight">Sistem Kas & Stok</span>
            </div>
          </div>
          <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-slate-600 text-white shadow-inner' : 'text-slate-200 hover:bg-slate-700'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      <main className="pt-14 md:pl-64 min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
