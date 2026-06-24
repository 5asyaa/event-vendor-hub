require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
const vendorRoutes = require("./routes/vendors");
const serviceRoutes = require("./routes/services");

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    service: "vendor-service",
    status: "running"
  });
});

// VENDOR ENDPOINTS
app.use("/vendors", vendorRoutes);

// SERVICE ENDPOINTS
app.use("/services", serviceRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Vendor Service running on port ${PORT}`);
});