require("dotenv").config();
require("./config/db");

const express = require("express");
const app = express();

app.use(express.json());

const reviewRoutes = require("./routes/reviews");

app.get("/", (req, res) => {
  res.json({
    service: "review-service",
    status: "running"
  });
});

app.use("/reviews", reviewRoutes);

const PORT = 3005;

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});