const express = require("express");

const {
  startSession,
  endSession,
  getRoomSessions,
} = require("../controllers/sessionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/start", startSession);
router.patch("/:id/end", endSession);
router.get("/room/:roomId", getRoomSessions);

module.exports = router;