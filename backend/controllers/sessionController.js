const Session = require("../models/Session");
const Room = require("../models/Room");

// Start a study session
const startSession = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        message: "Room ID is required",
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      members: req.user._id,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found or access denied",
      });
    }

    const existingSession = await Session.findOne({
      room: roomId,
      status: "active",
    });

    if (existingSession) {
      return res.status(400).json({
        message: "A session is already active in this room",
      });
    }

    const session = await Session.create({
      room: roomId,
      startedBy: req.user._id,
      startedAt: new Date(),
      status: "active",
    });

    const populatedSession = await Session.findById(session._id)
      .populate("room", "name code")
      .populate("startedBy", "name email");

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({
      message: "Failed to start session",
      error: error.message,
    });
  }
};

// End a study session
const endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const room = await Room.findOne({
      _id: session.room,
      members: req.user._id,
    });

    if (!room) {
      return res.status(403).json({
        message: "You are not a member of this room",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        message: "Session is already completed",
      });
    }

    session.endedAt = new Date();

    session.duration = Math.floor(
      (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
    );

    session.status = "completed";

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate("room", "name code")
      .populate("startedBy", "name email");

    res.json(populatedSession);
  } catch (error) {
    res.status(500).json({
      message: "Failed to end session",
      error: error.message,
    });
  }
};

// Get sessions for a room
const getRoomSessions = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      members: req.user._id,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found or access denied",
      });
    }

    const sessions = await Session.find({
      room: req.params.roomId,
    })
      .populate("startedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
};

module.exports = {
  startSession,
  endSession,
  getRoomSessions,
};