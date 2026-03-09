# Sistem Kas dan Manajemen Stok Material

Aplikasi manajemen stok material dan kas proyek dengan React (Vite) di frontend dan Node.js (Express) + MySQL di backend.

## Struktur Project

```
aplikasi-stok/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── server.js      # Satu file server (Express + API)
│   └── package.json
├── database/
│   ├── schema.sql     # DDL tabel MySQL
│   └── dummy_data.sql # Data contoh
└── README.md
```

## Persyaratan

- Node.js (v18+ disarankan)
- MySQL (8.x atau 5.7)

## Setup Database MySQL

1. Login ke MySQL:
   ```bash
   mysql -u root -p
   ```

2. Jalankan script schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. (Opsional) Isi data dummy:
   ```bash
   mysql -u root -p < database/dummy_data.sql
   ```

4. Jika user/password/database berbeda, atur variabel environment backend:
   - `DB_HOST` (default: localhost)
   - `DB_USER` (default: root)
   - `DB_PASSWORD` (default: kosong)
   - `DB_NAME` (default: aplikasi_stok)

## Cara Menjalankan Project

### 1. Backend

```bash
cd backend
npm install
npm start
```

Server berjalan di **http://localhost:5000**.

### 2. Frontend

Di terminal lain:

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di **http://localhost:3000**. Vite sudah dikonfigurasi proxy `/api` ke `http://localhost:5000`, jadi request dari browser ke `/api/*` akan diteruskan ke backend.

### Ringkasan

1. Pastikan MySQL sudah jalan dan database `aplikasi_stok` beserta tabelnya sudah dibuat (jalankan `schema.sql`).
2. Jalankan backend: `cd backend && npm install && npm start`
3. Jalankan frontend: `cd frontend && npm install && npm run dev`
4. Buka browser: **http://localhost:3000**

## Menu Aplikasi

| Menu | Keterangan |
|------|------------|
| Dashboard | Ringkasan pemasukan, pengeluaran, gaji, belanja material, jumlah stok |
| Input Material | Tambah material (nama, satuan) + daftar material |
| Input Lokasi | Tambah lokasi (nama, keterangan) + daftar lokasi |
| Material Masuk | Catat material masuk per material, lokasi, qty, tanggal |
| Material Keluar | Catat material keluar per material, lokasi, qty, tanggal |
| Stok Gudang | Tabel agregat: Material, Total Masuk, Total Keluar, Stok |
| Pengeluaran Kantor | Catat pengeluaran kantor |
| Gaji Tukang | Catat gaji tukang |
| Pemasukan | Catat pemasukan |
| Belanja Material | Catat belanja material (qty × harga = total otomatis) |
| Rekap Laporan | Total pemasukan, pengeluaran, gaji, belanja material, dan **Saldo Kas** |

Rumus **Saldo Kas**:  
`Saldo = Pemasukan − Pengeluaran Kantor − Gaji Tukang − Belanja Material`

Rumus **Stok Gudang**:  
`Stok = Total Material Masuk − Total Material Keluar` (agregasi per material).

## Tech Stack

- **Frontend:** React, Vite, JSX, TailwindCSS, Axios, React Router DOM
- **Backend:** Node.js, Express.js, mysql2, cors
- **Database:** MySQL

## API Base URL

Dari frontend (via proxy): `/api`.  
Langsung ke backend: `http://localhost:5000/api`.

Contoh endpoint: `GET /api/materials`, `POST /api/materials`, `GET /api/stok`, `GET /api/dashboard`, `GET /api/rekap`, dll.
# sr-group
