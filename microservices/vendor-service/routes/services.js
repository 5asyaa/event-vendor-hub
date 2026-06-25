const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// GET /services
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM services",
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengambil data services",
          error: err
        });
      }

      res.json(result);
    }
  );
});

// GET /services/:id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT * FROM services WHERE id_service = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengambil data service",
          error: err
        });
      }
      if (result.length === 0) {
        return res.status(404).json({
          message: "Service tidak ditemukan"
        });
      }
      res.json(result[0]);
    }
  );
});

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST /services
router.post("/", auth, upload.single("gambar_paket"), (req, res) => {
  const { id_vendor, nama_paket, jenis_jasa, harga, deskripsi_layanan, portofolio_url, fitur, level_paket } = req.body;
  
  // If file uploaded, use the uploaded path, otherwise try to use the text field (if any), or empty string
  let gambar_paket = "";
  if (req.file) {
    gambar_paket = "/uploads/" + req.file.filename;
  } else if (req.body.gambar_paket) {
    gambar_paket = req.body.gambar_paket;
  }
  
  db.query(
    `INSERT INTO services 
    (id_vendor, nama_paket, jenis_jasa, harga, deskripsi_layanan, portofolio_url, fitur, gambar_paket, level_paket) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_vendor, nama_paket, jenis_jasa, harga, deskripsi_layanan, portofolio_url, fitur, gambar_paket, level_paket],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Gagal menambahkan service",
          error: err
        });
      }
      res.json({
        message: "Layanan berhasil ditambahkan",
        id_service: result.insertId
      });
    }
  );
});

module.exports = router;