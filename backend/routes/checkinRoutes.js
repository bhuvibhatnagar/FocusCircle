const express = require("express");

const {
  joinSession,
  submitCheckIn,
  leaveSession,
  getSessionParticipants,
} = require("../controllers/checkinController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/join", joinSession);
router.post("/submit", submitCheckIn);
router.post("/leave", leaveSession);
router.get("/session/:sessionId", getSessionParticipants);

module.exports = router;