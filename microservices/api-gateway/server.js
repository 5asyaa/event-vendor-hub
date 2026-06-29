const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const path = require("path");
const fs = require("fs");

app.use(cors());

// Serve static frontend files
const frontendPath = path.resolve(__dirname, "../../frontend/views");

console.log("__dirname   =", __dirname);
console.log("frontendPath =", frontendPath);
console.log("exists       =", fs.existsSync(frontendPath));

// Serve each sub-folder at its matching URL prefix so existing links keep working:
//   /             → views/public/index.html
//   /login.html   → views/public/login.html
//   /customer/... → views/customer/...
//   /vendor/...   → views/vendor/...
//   /admin/...    → views/admin/...
app.use(express.static(path.join(frontendPath, "public")));
app.use("/public",   express.static(path.join(frontendPath, "public")));
app.use("/customer", express.static(path.join(frontendPath, "customer")));
app.use("/vendor",   express.static(path.join(frontendPath, "vendor")));
app.use("/admin",    express.static(path.join(frontendPath, "admin")));

// Root → public/index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "public", "index.html"));
});

// Service URLs — pakai env variable di production, fallback ke localhost untuk dev
const AUTH_URL    = process.env.AUTH_URL    || "http://localhost:3001";
const VENDOR_URL  = process.env.VENDOR_URL  || "http://localhost:3002";
const BOOKING_URL = process.env.BOOKING_URL || "http://localhost:3003";
const PAYMENT_URL = process.env.PAYMENT_URL || "http://localhost:3004";
const REVIEW_URL  = process.env.REVIEW_URL  || "http://localhost:3005";

// AUTH
app.use(
  "/auth",
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true
  })
);

// VENDOR
app.use(
  "/vendors",
  createProxyMiddleware({
    target: VENDOR_URL,
    changeOrigin: true
  })
);

// SERVICES
app.use(
  "/services",
  createProxyMiddleware({
    target: VENDOR_URL,
    changeOrigin: true
  })
);

// UPLOADS
app.use(
  "/uploads",
  createProxyMiddleware({
    target: VENDOR_URL,
    changeOrigin: true
  })
);

// BOOKING
app.use(
  "/bookings",
  createProxyMiddleware({
    target: BOOKING_URL,
    changeOrigin: true
  })
);

// PAYMENT
app.use(
  "/payments",
  createProxyMiddleware({
    target: PAYMENT_URL,
    changeOrigin: true
  })
);

// REVIEW
app.use(
  "/reviews",
  createProxyMiddleware({
    target: REVIEW_URL,
    changeOrigin: true
  })
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});