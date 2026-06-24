require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

// AUTH ROUTES
const authRoutes = require("./routes/auth");

app.use("/auth", authRoutes);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});