const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const goalRoutes = require("./routes/goalRoutes");
const roomRoutes = require("./routes/roomRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "FocusCircle API is running",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Goal routes
app.use("/api/goals", goalRoutes);

//Room routes
app.use("/api/rooms", roomRoutes);

//Session routes
app.use("/api/sessions", sessionRoutes);

//Checkin routes
app.use("/api/checkins", checkinRoutes);

//Analytic routes
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`FocusCircle server running on port ${PORT}`);
});