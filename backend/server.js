const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aplikasi_stok',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

const JWT_SECRET = process.env.JWT_SECRET || 'aplikasi-stok-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';
const ROLE_ADMIN_GUDANG = 'ADMIN_GUDANG';
const ROLE_ADMIN_KANTOR = 'ADMIN_KANTOR';

async function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

function auth(requiredRoles = []) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

function parsePagination(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(10, parseInt(req.query.limit, 10) || 10);
  return { page, limit, offset: (page - 1) * limit };
}

function validateRole(role) {
  const allowed = [ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG, ROLE_ADMIN_KANTOR];
  return allowed.includes(role);
}

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }
    const conn = await getPool();
    const [rows] = await conn.execute(
      'SELECT id, username, password_hash, role FROM tabel_users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', auth(), async (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/users', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const conn = await getPool();
    const [rows] = await conn.execute(
      'SELECT id, username, role, created_at FROM tabel_users ORDER BY created_at DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, dan role wajib diisi' });
    }
    if (!validateRole(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, passwordHash, role]
    );
    res.status(201).json({ id: result.insertId, username, role });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !role) {
      return res.status(400).json({ error: 'Username dan role wajib diisi' });
    }
    if (!validateRole(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }
    const conn = await getPool();
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await conn.execute(
        'UPDATE tabel_users SET username = ?, password_hash = ?, role = ? WHERE id = ?',
        [username, passwordHash, role, req.params.id]
      );
    } else {
      await conn.execute(
        'UPDATE tabel_users SET username = ?, role = ? WHERE id = ?',
        [username, role, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/materials', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const conn = await getPool();
    const search = (req.query.search || '').trim();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const whereClause = search ? ' WHERE nama_material LIKE ? OR satuan LIKE ? OR supplier LIKE ?' : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_material' + whereClause, searchParams);
      const [rows] = await conn.execute(
        'SELECT * FROM tabel_material' + whereClause + ' ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [...searchParams, limit, offset]
      );
      res.json({
        data: rows,
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      });
    } else {
      const [rows] = await conn.execute('SELECT * FROM tabel_material' + whereClause + ' ORDER BY created_at DESC', searchParams);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/materials', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const { nama_material, satuan, harga, supplier } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_material (nama_material, satuan, harga, supplier) VALUES (?, ?, ?, ?)',
      [nama_material, satuan, harga ?? 0, supplier || '']
    );
    res.status(201).json({ id: result.insertId, nama_material, satuan, harga: harga ?? 0, supplier: supplier || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/materials/:id', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const { nama_material, satuan, harga, supplier } = req.body;
    const conn = await getPool();
    await conn.execute(
      'UPDATE tabel_material SET nama_material = ?, satuan = ?, harga = ?, supplier = ? WHERE id = ?',
      [nama_material, satuan, harga ?? 0, supplier || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/materials/:id', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_material WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/locations', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const hasPagination = req.query.page != null && req.query.limit != null;
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_lokasi');
      const [rows] = await conn.execute(
        'SELECT * FROM tabel_lokasi ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute('SELECT * FROM tabel_lokasi ORDER BY created_at DESC');
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/locations', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const { nama_lokasi, keterangan } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_lokasi (nama_lokasi, keterangan) VALUES (?, ?)',
      [nama_lokasi, keterangan || '']
    );
    res.status(201).json({ id: result.insertId, nama_lokasi, keterangan: keterangan || '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/locations/:id', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const { nama_lokasi, keterangan } = req.body;
    const conn = await getPool();
    await conn.execute(
      'UPDATE tabel_lokasi SET nama_lokasi = ?, keterangan = ? WHERE id = ?',
      [nama_lokasi, keterangan ?? '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/locations/:id', auth([ROLE_SUPER_ADMIN]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_lokasi WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/material-masuk', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const conn = await getPool();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const baseSql = `SELECT mm.*, m.nama_material, m.satuan, m.harga, l.nama_lokasi
       FROM tabel_material_masuk mm
       LEFT JOIN tabel_material m ON mm.material_id = m.id
       LEFT JOIN tabel_lokasi l ON mm.lokasi_id = l.id
       ORDER BY mm.tanggal DESC, mm.created_at DESC`;
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_material_masuk');
      const [rows] = await conn.execute(baseSql + ' LIMIT ? OFFSET ?', [limit, offset]);
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute(baseSql);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/material-masuk', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const { material_id, lokasi_id, qty, tanggal, keterangan } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_material_masuk (material_id, lokasi_id, qty, tanggal, keterangan) VALUES (?, ?, ?, ?, ?)',
      [material_id, lokasi_id, qty, tanggal, keterangan || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/material-masuk/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_material_masuk WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/material-keluar', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const conn = await getPool();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const baseSql = `SELECT mk.*, m.nama_material, m.satuan, m.harga,
       l_asal.nama_lokasi AS nama_lokasi_asal,
       l_tujuan.nama_lokasi AS nama_lokasi_tujuan
       FROM tabel_material_keluar mk
       LEFT JOIN tabel_material m ON mk.material_id = m.id
       LEFT JOIN tabel_lokasi l_asal ON mk.lokasi_id = l_asal.id
       LEFT JOIN tabel_lokasi l_tujuan ON mk.lokasi_tujuan_id = l_tujuan.id
       ORDER BY mk.tanggal DESC, mk.created_at DESC`;
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_material_keluar');
      const [rows] = await conn.execute(baseSql + ' LIMIT ? OFFSET ?', [limit, offset]);
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute(baseSql);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/material-keluar', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const { material_id, lokasi_id, lokasi_tujuan_id, qty, tanggal, keterangan } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_material_keluar (material_id, lokasi_id, lokasi_tujuan_id, qty, tanggal, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [material_id, lokasi_id, lokasi_tujuan_id || null, qty, tanggal, keterangan || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/material-keluar/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_material_keluar WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pemasukan', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const search = (req.query.search || '').trim();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const whereClause = search ? ' WHERE nama_pemasukan LIKE ? OR keterangan LIKE ?' : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_pemasukan' + whereClause, searchParams);
      const [rows] = await conn.execute(
        'SELECT * FROM tabel_pemasukan' + whereClause + ' ORDER BY tanggal DESC, created_at DESC LIMIT ? OFFSET ?',
        [...searchParams, limit, offset]
      );
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute('SELECT * FROM tabel_pemasukan' + whereClause + ' ORDER BY tanggal DESC, created_at DESC', searchParams);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pemasukan', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { nama_pemasukan, jumlah, tanggal, keterangan, lokasi } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_pemasukan (nama_pemasukan, jumlah, tanggal, keterangan, lokasi) VALUES (?, ?, ?, ?, ?)',
      [nama_pemasukan, jumlah, tanggal, keterangan || '', lokasi || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pemasukan/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { nama_pemasukan, jumlah, tanggal, keterangan, lokasi } = req.body;
    const conn = await getPool();
    await conn.execute(
      'UPDATE tabel_pemasukan SET nama_pemasukan = ?, jumlah = ?, tanggal = ?, keterangan = ?, lokasi = ? WHERE id = ?',
      [nama_pemasukan, jumlah, tanggal, keterangan || '', lokasi || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pemasukan/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_pemasukan WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pengeluaran', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const search = (req.query.search || '').trim();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const whereClause = search ? ' WHERE nama_pengeluaran LIKE ? OR keterangan LIKE ?' : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_pengeluaran_kantor' + whereClause, searchParams);
      const [rows] = await conn.execute(
        'SELECT * FROM tabel_pengeluaran_kantor' + whereClause + ' ORDER BY tanggal DESC, created_at DESC LIMIT ? OFFSET ?',
        [...searchParams, limit, offset]
      );
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute('SELECT * FROM tabel_pengeluaran_kantor' + whereClause + ' ORDER BY tanggal DESC, created_at DESC', searchParams);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pengeluaran', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { nama_pengeluaran, jumlah, tanggal, keterangan, lokasi } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_pengeluaran_kantor (nama_pengeluaran, jumlah, tanggal, keterangan, lokasi) VALUES (?, ?, ?, ?, ?)',
      [nama_pengeluaran, jumlah, tanggal, keterangan || '', lokasi || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/pengeluaran/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { nama_pengeluaran, jumlah, tanggal, keterangan, lokasi } = req.body;
    const conn = await getPool();
    await conn.execute(
      'UPDATE tabel_pengeluaran_kantor SET nama_pengeluaran = ?, jumlah = ?, tanggal = ?, keterangan = ?, lokasi = ? WHERE id = ?',
      [nama_pengeluaran, jumlah, tanggal, keterangan || '', lokasi || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pengeluaran/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_pengeluaran_kantor WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gaji', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const search = (req.query.search || '').trim();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const whereClause = search ? ' WHERE nama_tukang LIKE ? OR keterangan LIKE ?' : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [[{ total }]] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_gaji_tukang' + whereClause, searchParams);
      const [rows] = await conn.execute(
        'SELECT * FROM tabel_gaji_tukang' + whereClause + ' ORDER BY tanggal DESC, created_at DESC LIMIT ? OFFSET ?',
        [...searchParams, limit, offset]
      );
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute('SELECT * FROM tabel_gaji_tukang' + whereClause + ' ORDER BY tanggal DESC, created_at DESC', searchParams);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gaji', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { nama_tukang, jumlah, tanggal, keterangan, lokasi } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_gaji_tukang (nama_tukang, jumlah, tanggal, keterangan, lokasi) VALUES (?, ?, ?, ?, ?)',
      [nama_tukang, jumlah, tanggal, keterangan || '', lokasi || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/gaji/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { nama_tukang, jumlah, tanggal, keterangan, lokasi } = req.body;
    const conn = await getPool();
    await conn.execute(
      'UPDATE tabel_gaji_tukang SET nama_tukang = ?, jumlah = ?, tanggal = ?, keterangan = ?, lokasi = ? WHERE id = ?',
      [nama_tukang, jumlah, tanggal, keterangan || '', lokasi || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gaji/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_gaji_tukang WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/belanja-material', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const search = (req.query.search || '').trim();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const whereClause = search ? ' WHERE m.nama_material LIKE ? OR bm.keterangan LIKE ?' : '';
    const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
    const baseSql = `SELECT bm.*, m.nama_material, m.satuan
       FROM tabel_belanja_material bm
       LEFT JOIN tabel_material m ON bm.material_id = m.id` + whereClause + `
       ORDER BY bm.tanggal DESC, bm.created_at DESC`;
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const countSql = `SELECT COUNT(*) AS total FROM tabel_belanja_material bm LEFT JOIN tabel_material m ON bm.material_id = m.id` + whereClause;
      const [[{ total }]] = await conn.execute(countSql, searchParams);
      const [rows] = await conn.execute(baseSql + ' LIMIT ? OFFSET ?', [...searchParams, limit, offset]);
      res.json({ data: rows, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) });
    } else {
      const [rows] = await conn.execute(baseSql, searchParams);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/belanja-material', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { material_id, qty, harga, total, tanggal, keterangan } = req.body;
    const conn = await getPool();
    const [result] = await conn.execute(
      'INSERT INTO tabel_belanja_material (material_id, qty, harga, total, tanggal, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [material_id, qty, harga, total, tanggal, keterangan || '']
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/belanja-material/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const { material_id, qty, harga, total, tanggal, keterangan } = req.body;
    const conn = await getPool();
    await conn.execute(
      'UPDATE tabel_belanja_material SET material_id = ?, qty = ?, harga = ?, total = ?, tanggal = ?, keterangan = ? WHERE id = ?',
      [material_id, qty, harga, total, tanggal, keterangan || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/belanja-material/:id', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    await conn.execute('DELETE FROM tabel_belanja_material WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stok', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG]), async (req, res) => {
  try {
    const conn = await getPool();
    const search = (req.query.search || '').trim();
    const hasPagination = req.query.page != null && req.query.limit != null;
    const materialWhere = search ? ' WHERE m.nama_material LIKE ?' : '';
    const searchParams = search ? [`%${search}%`] : [];
    const subquery = `SELECT m.id AS material_id, m.nama_material, m.satuan, m.harga,
         COALESCE(mm.total, 0) AS total_masuk, COALESCE(mk.total, 0) AS total_keluar,
         (COALESCE(mm.total, 0) - COALESCE(mk.total, 0)) AS stok
       FROM tabel_material m
       LEFT JOIN (SELECT material_id, SUM(qty) AS total FROM tabel_material_masuk GROUP BY material_id) mm ON m.id = mm.material_id
       LEFT JOIN (
         SELECT material_id, SUM(qty) AS total
         FROM tabel_material_keluar
         GROUP BY material_id
       ) mk ON m.id = mk.material_id` + materialWhere + `
       ORDER BY m.nama_material`;
    if (hasPagination) {
      const { page, limit, offset } = parsePagination(req);
      const [countRows] = await conn.execute('SELECT COUNT(*) AS total FROM tabel_material' + (search ? ' WHERE nama_material LIKE ?' : ''), searchParams);
      const total = Number(countRows[0].total);
      const [rows] = await conn.execute(
        `SELECT * FROM (${subquery}) AS stok_table LIMIT ? OFFSET ?`,
        [...searchParams, limit, offset]
      );
      res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } else {
      const [rows] = await conn.execute(subquery, searchParams);
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_GUDANG, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const [pemasukanRows] = await conn.execute('SELECT COALESCE(SUM(jumlah), 0) AS total FROM tabel_pemasukan');
    const [pengeluaranRows] = await conn.execute('SELECT COALESCE(SUM(jumlah), 0) AS total FROM tabel_pengeluaran_kantor');
    const [gajiRows] = await conn.execute('SELECT COALESCE(SUM(jumlah), 0) AS total FROM tabel_gaji_tukang');
    const [belanjaRows] = await conn.execute('SELECT COALESCE(SUM(total), 0) AS total FROM tabel_belanja_material');
    const [stokRows] = await conn.execute(
      `SELECT COUNT(DISTINCT m.id) AS jumlah_material,
        COALESCE(SUM(COALESCE(mm.qty, 0) - COALESCE(mk.qty, 0)), 0) AS total_item_stok
       FROM tabel_material m
       LEFT JOIN (SELECT material_id, SUM(qty) AS qty FROM tabel_material_masuk GROUP BY material_id) mm ON m.id = mm.material_id
       LEFT JOIN (SELECT material_id, SUM(qty) AS qty FROM tabel_material_keluar GROUP BY material_id) mk ON m.id = mk.material_id`
    );
    res.json({
      total_pemasukan: Number(pemasukanRows[0].total),
      total_pengeluaran: Number(pengeluaranRows[0].total),
      total_gaji: Number(gajiRows[0].total),
      total_belanja_material: Number(belanjaRows[0].total),
      jumlah_material: Number(stokRows[0].jumlah_material),
      total_item_stok: Number(stokRows[0].total_item_stok),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rekap', auth([ROLE_SUPER_ADMIN, ROLE_ADMIN_KANTOR]), async (req, res) => {
  try {
    const conn = await getPool();
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const dateFilter = startDate && endDate
      ? ' WHERE tanggal BETWEEN ? AND ?'
      : '';
    const dateParams = startDate && endDate ? [startDate, endDate] : [];
    const [pemasukanRows] = await conn.execute(
      'SELECT COALESCE(SUM(jumlah), 0) AS total FROM tabel_pemasukan' + dateFilter,
      dateParams
    );
    const [pengeluaranRows] = await conn.execute(
      'SELECT COALESCE(SUM(jumlah), 0) AS total FROM tabel_pengeluaran_kantor' + dateFilter,
      dateParams
    );
    const [gajiRows] = await conn.execute(
      'SELECT COALESCE(SUM(jumlah), 0) AS total FROM tabel_gaji_tukang' + dateFilter,
      dateParams
    );
    const [belanjaRows] = await conn.execute(
      'SELECT COALESCE(SUM(total), 0) AS total FROM tabel_belanja_material' + dateFilter,
      dateParams
    );
    const total_pemasukan = Number(pemasukanRows[0].total);
    const total_pengeluaran = Number(pengeluaranRows[0].total);
    const total_gaji = Number(gajiRows[0].total);
    const total_belanja = Number(belanjaRows[0].total);
    const saldo = total_pemasukan - total_pengeluaran - total_gaji - total_belanja;
    res.json({
      total_pemasukan,
      total_pengeluaran,
      total_gaji,
      total_belanja_material: total_belanja,
      saldo_kas: saldo,
      start_date: startDate,
      end_date: endDate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
