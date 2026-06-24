const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const paymentController = require("../controllers/paymentController");

// Public routes (Xendit callback)
router.post("/callback", paymentController.paymentCallback);

// Protected routes (JWT verification required)
router.get("/", auth, paymentController.getAll);
router.post("/", auth, paymentController.createPayment);
router.post("/create", auth, paymentController.createPayment);
router.get("/booking/:id_booking", auth, paymentController.getByBookingId);
router.get("/:id", auth, paymentController.getById);

module.exports = router;