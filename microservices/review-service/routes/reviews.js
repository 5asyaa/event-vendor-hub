const express    = require("express");
const router     = express.Router();
const auth       = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

// GET semua review
router.get("/", reviewController.getAll);

// GET review berdasarkan vendor
router.get("/vendor/:id_vendor", reviewController.getByVendor);

// GET review berdasarkan booking
router.get("/booking/:id_booking", reviewController.getByBooking);

// POST buat review baru (perlu login)
router.post("/", auth, reviewController.createReview);

module.exports = router;
