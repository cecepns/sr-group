-- Buat tabel master lokasi untuk manajemen lokasi
CREATE TABLE IF NOT EXISTS tabel_lokasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lokasi VARCHAR(255) NOT NULL,
  keterangan TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

