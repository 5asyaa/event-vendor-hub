const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const bookingController = require("../controllers/bookingController");

// Internal service-to-service routes (no JWT required)
// These are called by payment-service internally
router.patch("/:id/confirm", bookingController.confirmBooking);
router.patch("/:id/reject", bookingController.rejectBooking);
router.patch("/:id/payment-status", bookingController.updatePaymentStatus);

// Protected routes (JWT required)
router.use(auth);

router.get("/", bookingController.getAll);
router.post("/", bookingController.createBooking);
router.get("/:id", bookingController.getById);

module.exports = router;