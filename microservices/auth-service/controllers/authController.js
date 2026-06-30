const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ================= REGISTER =================
exports.register = (req, res) => {
  const { nama, email, password, role, no_hp } = req.body;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    db.query(
      "INSERT INTO users (nama, email, password, role, no_hp) VALUES (?, ?, ?, ?, ?)",
      [nama, email, hashedPassword, role, no_hp || null],
      async (err, result) => {
        if (err) return res.status(500).json(err);

        const userId = result.insertId;

        // Jika role vendor, buat profile vendor otomatis ke vendor-service
        if (role === 'vendor') {
          const vendorServiceUrl = process.env.VENDOR_SERVICE_URL || 'http://localhost:3002';
          try {
            const vRes = await fetch(`${vendorServiceUrl}/vendors`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id_user: userId,
                nama_usaha: nama,
                link_whatsapp: no_hp || null
              })
            });
            if (!vRes.ok) {
              const errBody = await vRes.json().catch(() => ({}));
              console.error('Gagal create vendor profile:', errBody);
            } else {
              console.log('Vendor profile created successfully for user_id:', userId);
            }
          } catch (fetchErr) {
            console.error('Koneksi ke vendor-service gagal saat registrasi:', fetchErr.message);
          }
        }

        res.json({
          message: "Register berhasil",
          user_id: userId
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

// ================= LOGIN =================
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        const user = result[0];

        // Verify password using bcrypt
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          return res.status(401).json({
            message: "Email / Password salah"
          });
        }

        // Jika role vendor, cek status verifikasi
        if (user.role === 'vendor') {
          // Import db vendor langsung tidak bisa (beda service), jadi kita cek via HTTP ke vendor-service
          // Namun karena kita di auth-service, kita cek di tabel vendors jika db-nya sama,
          // atau kita tambahkan kolom status_verifikasi_vendor di tabel users.
          // Solusi: query langsung ke vendor-service atau lewat internal call.
          // Di sini kita gunakan pendekatan: fetch ke vendor-service via internal URL.
          const vendorServiceUrl = process.env.VENDOR_SERVICE_URL || 'http://localhost:3002';
          try {
            const vRes = await fetch(`${vendorServiceUrl}/vendors`);
            if (vRes.ok) {
              const vendors = await vRes.json();
              const vendorProfile = vendors.find(v => Number(v.id_user) === Number(user.id_user));
              if (vendorProfile && vendorProfile.status_verifikasi !== 'approved') {
                const statusMsg = vendorProfile.status_verifikasi === 'rejected'
                  ? 'Akun vendor Anda telah ditolak oleh admin. Hubungi admin untuk informasi lebih lanjut.'
                  : 'Akun vendor Anda sedang menunggu verifikasi admin. Silakan tunggu hingga akun disetujui.';
                return res.status(403).json({ message: statusMsg, status_verifikasi: vendorProfile.status_verifikasi });
              }
            }
          } catch (fetchErr) {
            console.error('Gagal cek verifikasi vendor:', fetchErr.message);
            // Jika vendor-service tidak bisa dihubungi, biarkan login (fail open)
          }
        }

        const token = jwt.sign(
          { id: user.id_user, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          message: "Login berhasil",
          token: token,
          user: {
            id_user: user.id_user,
            nama: user.nama,
            email: user.email,
            role: user.role
          }
        });
      } else {
        res.status(401).json({
          message: "Email / Password salah"
        });
      }
    }
  );
};

// ================= LOGOUT =================
exports.logout = (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({
        message: "Token tidak ditemukan"
      });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 BLACKLIST TOKEN
    global.blacklist = global.blacklist || [];
    global.blacklist.push(token);

    return res.json({
      message: "Logout berhasil"
    });

    } catch (error) {
    return res.status(500).json(error);
  }
};

// ================= GET USER BY ID =================
exports.getUserById = (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT id_user, nama, email, no_hp, role FROM users WHERE id_user = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

// ================= GET ALL USERS =================
exports.getAllUsers = (req, res) => {
  db.query(
    "SELECT id_user, nama, email, no_hp, role FROM users ORDER BY id_user DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// ================= UPDATE PROFILE =================
exports.updateProfile = (req, res) => {
  const id = req.params.id;
  const { nama, no_hp, password } = req.body;

  // Jika ada password baru, hash dulu sebelum disimpan
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    db.query(
      "UPDATE users SET nama = ?, no_hp = ?, password = ? WHERE id_user = ?",
      [nama, no_hp || null, hashedPassword, id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User tidak ditemukan" });
        res.json({ message: "Profil berhasil diperbarui (termasuk password)" });
      }
    );
  } else {
    db.query(
      "UPDATE users SET nama = ?, no_hp = ? WHERE id_user = ?",
      [nama, no_hp || null, id],
      (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: "User tidak ditemukan" });
        res.json({ message: "Profil berhasil diperbarui" });
      }
    );
  }
};