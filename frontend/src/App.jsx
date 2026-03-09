import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import InputMaterial from './pages/InputMaterial';
import InputLokasi from './pages/InputLokasi';
import MaterialMasuk from './pages/MaterialMasuk';
import MaterialKeluar from './pages/MaterialKeluar';
import StokGudang from './pages/StokGudang';
import PengeluaranKantor from './pages/PengeluaranKantor';
import GajiTukang from './pages/GajiTukang';
import Pemasukan from './pages/Pemasukan';
import BelanjaMaterial from './pages/BelanjaMaterial';
import RekapLaporan from './pages/RekapLaporan';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-700 font-medium">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_GUDANG', 'ADMIN_KANTOR']}>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="input-material"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <InputMaterial />
            </ProtectedRoute>
          )}
        />
        <Route
          path="input-lokasi"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <InputLokasi />
            </ProtectedRoute>
          )}
        />
        <Route
          path="material-masuk"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_GUDANG']}>
              <MaterialMasuk />
            </ProtectedRoute>
          )}
        />
        <Route
          path="material-keluar"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_GUDANG']}>
              <MaterialKeluar />
            </ProtectedRoute>
          )}
        />
        <Route
          path="stok-gudang"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_GUDANG']}>
              <StokGudang />
            </ProtectedRoute>
          )}
        />
        <Route
          path="pengeluaran-kantor"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_KANTOR']}>
              <PengeluaranKantor />
            </ProtectedRoute>
          )}
        />
        <Route
          path="gaji-tukang"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_KANTOR']}>
              <GajiTukang />
            </ProtectedRoute>
          )}
        />
        <Route
          path="pemasukan"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_KANTOR']}>
              <Pemasukan />
            </ProtectedRoute>
          )}
        />
        <Route
          path="belanja-material"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_KANTOR']}>
              <BelanjaMaterial />
            </ProtectedRoute>
          )}
        />
        <Route
          path="rekap-laporan"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_KANTOR']}>
              <RekapLaporan />
            </ProtectedRoute>
          )}
        />
        <Route
          path="users"
          element={(
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          )}
        />
      </Route>
    </Routes>
  );
}
