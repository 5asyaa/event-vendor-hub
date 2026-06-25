require("dotenv").config();

console.log(
  "XENDIT KEY:",
  process.env.XENDIT_SECRET_KEY
    ? "TERBACA"
    : "TIDAK TERBACA"
);

require("./config/db");

const express = require("express");
const app = express();

app.use(express.json());

// Routes
const paymentRoutes = require("./routes/payments");
const testRoutes = require("./routes/test");

// Health Check
app.get("/", (req, res) => {
  res.json({
    service: "payment-service",
    status: "running"
  });
});

// Routes
app.use("/payments", paymentRoutes);
app.use("/test", testRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});