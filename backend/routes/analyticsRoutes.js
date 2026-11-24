const express = require("express");

const {
  getMyAnalytics,
} = require("../controllers/analyticsController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/me", getMyAnalytics);

module.exports = router;