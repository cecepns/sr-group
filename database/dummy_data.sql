-- Dummy data untuk aplikasi_stok
-- Jalankan setelah schema.sql

USE aplikasi_stok;

-- Material
INSERT INTO tabel_material (nama_material, satuan) VALUES
('Semen', 'Sak'),
('Pasir', 'm³'),
('Batu', 'm³'),
('Besi 8mm', 'Batang'),
('Kayu 5/7', 'Batang'),
('Keramik 60x60', 'Dus');

-- Lokasi
INSERT INTO tabel_lokasi (nama_lokasi, keterangan) VALUES
('Gudang Utama', 'Gudang pusat'),
('Proyek A - Jl. Merdeka', 'Site proyek perumahan'),
('Proyek B - Jl. Sudirman', 'Site proyek ruko');

-- Material Masuk (pastikan id material dan lokasi sesuai)
INSERT INTO tabel_material_masuk (material_id, lokasi_id, qty, tanggal, keterangan) VALUES
(1, 1, 100, '2025-03-01', 'Stok awal'),
(2, 1, 50, '2025-03-01', 'Stok awal'),
(3, 1, 30, '2025-03-02', 'Pengiriman dari supplier'),
(1, 2, 20, '2025-03-03', 'Transfer ke proyek A');

-- Material Keluar
INSERT INTO tabel_material_keluar (material_id, lokasi_id, qty, tanggal, keterangan) VALUES
(1, 1, 10, '2025-03-04', 'Pemakaian proyek'),
(2, 1, 5, '2025-03-04', 'Pemakaian proyek');

-- Pengeluaran Kantor
INSERT INTO tabel_pengeluaran_kantor (nama_pengeluaran, jumlah, tanggal, keterangan) VALUES
('Listrik', 500000, '2025-03-01', 'Bulan Maret'),
('Internet', 350000, '2025-03-01', 'Bulan Maret'),
('ATK', 200000, '2025-03-05', 'Alat tulis kantor');

-- Gaji Tukang
INSERT INTO tabel_gaji_tukang (nama_tukang, jumlah, tanggal, keterangan) VALUES
('Budi', 2500000, '2025-03-01', 'Gaji Maret'),
('Andi', 2500000, '2025-03-01', 'Gaji Maret'),
('Slamet', 3000000, '2025-03-01', 'Mandor - Gaji Maret');

-- Pemasukan
INSERT INTO tabel_pemasukan (nama_pemasukan, jumlah, tanggal, keterangan) VALUES
('DP Proyek A', 50000000, '2025-03-01', 'Down payment 30%'),
('Termin 1 Proyek B', 25000000, '2025-03-10', 'Pekerjaan 25%');

-- Belanja Material
INSERT INTO tabel_belanja_material (material_id, qty, harga, total, tanggal, keterangan) VALUES
(1, 50, 65000, 3250000, '2025-03-02', 'Semen Tiga Roda'),
(2, 10, 250000, 2500000, '2025-03-02', 'Pasir cor'),
(4, 100, 85000, 8500000, '2025-03-03', 'Besi 8mm full');
