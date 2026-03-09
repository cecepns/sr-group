-- Database: aplikasi_stok
-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS aplikasi_stok;
USE aplikasi_stok;

-- Tabel Material
CREATE TABLE IF NOT EXISTS tabel_material (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_material VARCHAR(255) NOT NULL,
  satuan VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Lokasi
CREATE TABLE IF NOT EXISTS tabel_lokasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lokasi VARCHAR(255) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Material Masuk
CREATE TABLE IF NOT EXISTS tabel_material_masuk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  lokasi_id INT NOT NULL,
  qty DECIMAL(15,2) NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES tabel_material(id) ON DELETE CASCADE,
  FOREIGN KEY (lokasi_id) REFERENCES tabel_lokasi(id) ON DELETE CASCADE
);

-- Tabel Material Keluar
CREATE TABLE IF NOT EXISTS tabel_material_keluar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  lokasi_id INT NOT NULL,
  qty DECIMAL(15,2) NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES tabel_material(id) ON DELETE CASCADE,
  FOREIGN KEY (lokasi_id) REFERENCES tabel_lokasi(id) ON DELETE CASCADE
);

-- Tabel Pengeluaran Kantor
CREATE TABLE IF NOT EXISTS tabel_pengeluaran_kantor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_pengeluaran VARCHAR(255) NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Gaji Tukang
CREATE TABLE IF NOT EXISTS tabel_gaji_tukang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_tukang VARCHAR(255) NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pemasukan
CREATE TABLE IF NOT EXISTS tabel_pemasukan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_pemasukan VARCHAR(255) NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Belanja Material
CREATE TABLE IF NOT EXISTS tabel_belanja_material (
  id INT AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  qty DECIMAL(15,2) NOT NULL,
  harga DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  tanggal DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES tabel_material(id) ON DELETE CASCADE
);
