const express = require("express");

const {
  createRoom,
  getMyRooms,
  joinRoom,
  getRoom,
} = require("../controllers/roomController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createRoom);
router.get("/", getMyRooms);
router.post("/join", joinRoom);
router.get("/:id", getRoom);

module.exports = router;