const db = require("../config/db");

// ==========================
// UPDATE RATING AVG VENDOR (dipanggil oleh review-service)
// ==========================
exports.updateRating = (req, res) => {
  const id = req.params.id;
  const { rating_avg } = req.body;

  if (rating_avg === undefined || rating_avg === null) {
    return res.status(400).json({ message: "rating_avg wajib diisi." });
  }

  db.query(
    "UPDATE vendors SET rating_avg = ? WHERE id_vendor = ?",
    [rating_avg, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal update rating", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Vendor tidak ditemukan" });
      res.json({ message: "Rating vendor berhasil diperbarui", id_vendor: id, rating_avg });
    }
  );
};

// ==========================
// GET ALL VENDORS
// ==========================
exports.getAll = (req, res) => {
  db.query(
    "SELECT * FROM vendors",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal mengambil data vendor", error: err });
      res.json(result);
    }
  );
};

// ==========================
// GET ALL VENDORS (APPROVED ONLY) - untuk customer/public
// ==========================
exports.getApproved = (req, res) => {
  db.query(
    "SELECT * FROM vendors WHERE status_verifikasi = 'approved'",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal mengambil data vendor", error: err });
      res.json(result);
    }
  );
};

// ==========================
// GET VENDOR BY ID
// ==========================
exports.getById = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM vendors WHERE id_vendor = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal mengambil detail vendor", error: err });
      if (result.length === 0) return res.status(404).json({ message: "Vendor tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

// ==========================
// SEARCH VENDOR (approved only)
// ==========================
exports.searchVendor = (req, res) => {
  const keyword = req.query.keyword || "";
  db.query(
    `SELECT * FROM vendors
     WHERE status_verifikasi = 'approved'
     AND (nama_usaha LIKE ? OR deskripsi LIKE ?)`,
    [`%${keyword}%`, `%${keyword}%`],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal mencari vendor", error: err });
      res.json(result);
    }
  );
};

// ==========================
// CREATE VENDOR PROFILE FROM EXISTING USER (admin / recovery)
// ==========================
exports.createVendorFromUser = (req, res) => {
  const { id_user, nama_usaha, nama_user, jenis_jasa, alamat, deskripsi, link_whatsapp } = req.body;

  if (!id_user) {
    return res.status(400).json({ message: "id_user wajib diisi." });
  }

  // Gunakan nama_usaha jika ada, fallback ke nama_user
  const finalNamaUsaha = (nama_usaha || nama_user || '').trim();
  if (!finalNamaUsaha) {
    return res.status(400).json({ message: "nama_usaha atau nama_user wajib diisi." });
  }

  db.query(
    "SELECT id_vendor FROM vendors WHERE id_user = ?",
    [id_user],
    (err, existing) => {
      if (err) return res.status(500).json(err);
      if (existing.length > 0) {
        // Kembalikan id_vendor yang sudah ada agar tidak error
        return res.status(200).json({
          message: "Profil vendor sudah ada.",
          id_vendor: existing[0].id_vendor,
          status_verifikasi: 'pending'
        });
      }

      db.query(
        `INSERT INTO vendors (id_user, nama_usaha, jenis_jasa, alamat, deskripsi, link_whatsapp, status_verifikasi)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [id_user, finalNamaUsaha, jenis_jasa || null, alamat || null, deskripsi || null, link_whatsapp || null],
        (err, result) => {
          if (err) return res.status(500).json(err);
          res.status(201).json({
            message: "Profil vendor berhasil dibuat. Menunggu verifikasi admin.",
            id_vendor: result.insertId,
            status_verifikasi: 'pending'
          });
        }
      );
    }
  );
};

// ==========================
// CREATE VENDOR PROFILE
// ==========================
exports.createVendor = (req, res) => {
  const { id_user, nama_usaha, jenis_jasa, alamat, deskripsi, link_whatsapp } = req.body;

  if (!id_user || !nama_usaha) {
    return res.status(400).json({ message: "id_user dan nama_usaha wajib diisi." });
  }

  db.query(
    "SELECT id_vendor FROM vendors WHERE id_user = ?",
    [id_user],
    (err, existing) => {
      if (err) return res.status(500).json(err);
      if (existing.length > 0) {
        return res.status(409).json({ message: "Profil vendor untuk user ini sudah ada." });
      }

      db.query(
        `INSERT INTO vendors (id_user, nama_usaha, jenis_jasa, alamat, deskripsi, link_whatsapp, status_verifikasi)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [id_user, nama_usaha, jenis_jasa || null, alamat || null, deskripsi || null, link_whatsapp || null],
        (err, result) => {
          if (err) return res.status(500).json(err);
          res.status(201).json({
            message: "Profil vendor berhasil dibuat. Menunggu verifikasi admin.",
            id_vendor: result.insertId,
            status_verifikasi: 'pending'
          });
        }
      );
    }
  );
};

// ==========================
// UPDATE STATUS VERIFIKASI (admin only)
// ==========================
exports.updateVerificationStatus = (req, res) => {
  const id     = req.params.id;
  const { status_verifikasi } = req.body;

  const allowed = ['pending', 'approved', 'rejected'];
  if (!allowed.includes(status_verifikasi)) {
    return res.status(400).json({ message: "Status tidak valid. Gunakan: pending, approved, rejected" });
  }

  db.query(
    "UPDATE vendors SET status_verifikasi = ? WHERE id_vendor = ?",
    [status_verifikasi, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal update status verifikasi", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Vendor tidak ditemukan" });
      res.json({
        message: `Status vendor berhasil diubah ke '${status_verifikasi}'`,
        id_vendor: id,
        status_verifikasi
      });
    }
  );
};

// ==========================
// UPDATE JENIS JASA VENDOR
// ==========================
exports.updateJenisJasa = (req, res) => {
  const id = req.params.id;
  const { jenis_jasa } = req.body;

  db.query(
    "UPDATE vendors SET jenis_jasa = ? WHERE id_vendor = ?",
    [jenis_jasa, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal update jenis jasa", error: err });
      res.json({ message: "Jenis jasa berhasil diupdate", id_vendor: id, jenis_jasa });
    }
  );
};

// ==========================
// UPDATE PROFIL VENDOR (nama_usaha, jenis_jasa, alamat, deskripsi, link_whatsapp)
// ==========================
exports.updateVendorProfile = (req, res) => {
  const id = req.params.id;
  const { nama_usaha, jenis_jasa, alamat, deskripsi, link_whatsapp } = req.body;

  db.query(
    `UPDATE vendors SET 
      nama_usaha = COALESCE(?, nama_usaha),
      jenis_jasa = COALESCE(?, jenis_jasa),
      alamat = COALESCE(?, alamat),
      deskripsi = COALESCE(?, deskripsi),
      link_whatsapp = COALESCE(?, link_whatsapp)
     WHERE id_vendor = ?`,
    [nama_usaha || null, jenis_jasa || null, alamat || null, deskripsi || null, link_whatsapp || null, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Gagal update profil vendor", error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Vendor tidak ditemukan" });
      res.json({ message: "Profil vendor berhasil diperbarui", id_vendor: id });
    }
  );
};