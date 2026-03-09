-- Tambah kolom harga dan supplier pada tabel_material
ALTER TABLE tabel_material
  ADD COLUMN IF NOT EXISTS harga DECIMAL(18,2) NOT NULL DEFAULT 0 AFTER satuan,
  ADD COLUMN IF NOT EXISTS supplier VARCHAR(255) NOT NULL DEFAULT '' AFTER harga;

-- Tambah kolom lokasi_tujuan_id pada tabel_material_keluar
ALTER TABLE tabel_material_keluar
  ADD COLUMN IF NOT EXISTS lokasi_tujuan_id INT NULL AFTER lokasi_id;

-- Buat tabel_users untuk manajemen user & role
CREATE TABLE IF NOT EXISTS tabel_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Optional: buat super admin default (ganti password bila perlu)
-- Password default: admin123 (di-hash dengan bcrypt, 10 rounds)
INSERT INTO tabel_users (username, password_hash, role)
SELECT 'superadmin',
       '$2a$10$8s9b7r5j0iZgG1SxCq3xN.FQGqZ2iG1Xe5xWl3pK8c5XK6n4JYc8e',
       'SUPER_ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM tabel_users WHERE username = 'superadmin');

