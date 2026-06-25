require("dotenv").config();
require("./config/db");

const express = require("express");
const app = express();

app.use(express.json());

const bookingRoutes = require("./routes/bookings");

app.get("/", (req, res) => {
  res.json({
    service: "booking-service",
    status: "running"
  });
});

app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});