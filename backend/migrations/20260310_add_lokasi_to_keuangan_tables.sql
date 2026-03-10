-- Tambah kolom lokasi pada tabel_pemasukan
ALTER TABLE tabel_pemasukan
  ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255) NOT NULL DEFAULT '' AFTER keterangan;

-- Tambah kolom lokasi pada tabel_pengeluaran_kantor
ALTER TABLE tabel_pengeluaran_kantor
  ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255) NOT NULL DEFAULT '' AFTER keterangan;

-- Tambah kolom lokasi pada tabel_gaji_tukang
ALTER TABLE tabel_gaji_tukang
  ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255) NOT NULL DEFAULT '' AFTER keterangan;
