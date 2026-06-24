const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// REGISTER
router.post(
  "/register",
  authController.register
);

// LOGIN
router.post(
  "/login",
  authController.login
);

// LOGOUT
router.post(
  "/logout",
  (req, res) => {
    res.json({
      message: "Logout berhasil"
    });
  }
);

// GET USER BY ID
router.get(
  "/users/:id",
  authController.getUserById
);

// GET ALL USERS
router.get(
  "/users",
  authController.getAllUsers
);

// UPDATE PROFILE (nama, no_hp, password)
router.patch(
  "/users/:id",
  authController.updateProfile
);

module.exports = router;