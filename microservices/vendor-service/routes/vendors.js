const express = require("express");
const router  = express.Router();
const vendorController = require("../controllers/vendorController");

// GET ALL VENDORS (semua, termasuk pending - untuk admin)
router.get("/", vendorController.getAll);

// GET APPROVED VENDORS ONLY (untuk customer/public)
router.get("/approved", vendorController.getApproved);

// SEARCH VENDOR (approved only)
router.get("/search", vendorController.searchVendor);

// CREATE VENDOR PROFILE
router.post("/", vendorController.createVendor);

// CREATE VENDOR PROFILE FROM EXISTING USER (recovery/admin)
router.post("/from-user", vendorController.createVendorFromUser);

// GET VENDOR BY ID
router.get("/:id", vendorController.getById);

// UPDATE STATUS VERIFIKASI (admin)
router.patch("/:id/status", vendorController.updateVerificationStatus);

// UPDATE JENIS JASA
router.patch("/:id/jenis-jasa", vendorController.updateJenisJasa);

// UPDATE PROFIL VENDOR (nama_usaha, jenis_jasa, alamat, deskripsi, link_whatsapp)
router.patch("/:id/profile", vendorController.updateVendorProfile);

// UPDATE RATING AVG (dipanggil internal oleh review-service)
router.patch("/:id/rating", vendorController.updateRating);

module.exports = router;
