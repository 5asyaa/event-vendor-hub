const express = require("express");
const router = express.Router();

const testController = require("../controllers/testController");
const testInvoiceController = require("../controllers/testInvoiceController");

router.get("/", testController.testXendit);

router.get(
  "/invoice",
  testInvoiceController.createTestInvoice
);

module.exports = router;