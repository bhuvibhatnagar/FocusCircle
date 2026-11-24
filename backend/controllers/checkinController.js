const Participation = require("../models/Participation");
const Session = require("../models/Session");
const Room = require("../models/Room");

// Join a study session
const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const session = await Session.findById(sessionId);

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

    const existingParticipation = await Participation.findOne({
      session: sessionId,
      user: req.user._id,
    });

    if (existingParticipation) {
      return res.status(400).json({
        message: "You have already joined this session",
      });
    }

    const participation = await Participation.create({
      session: sessionId,
      user: req.user._id,
      joinedAt: new Date(),
    });

    const populatedParticipation = await Participation.findById(
      participation._id
    )
      .populate("user", "name email")
      .populate("session");

    res.status(201).json(populatedParticipation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to join session",
      error: error.message,
    });
  }
};

// Submit check-in
const submitCheckIn = async (req, res) => {
  try {
    const { sessionId, checkInMessage } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const participation = await Participation.findOne({
      session: sessionId,
      user: req.user._id,
    });

    if (!participation) {
      return res.status(404).json({
        message: "You have not joined this session",
      });
    }

    participation.checkIn = true;
    participation.checkInMessage = checkInMessage || "";

    await participation.save();

    const populatedParticipation = await Participation.findById(
      participation._id
    )
      .populate("user", "name email")
      .populate("session");

    res.json(populatedParticipation);
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit check-in",
      error: error.message,
    });
  }
};

// Leave a study session
const leaveSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "Session ID is required",
      });
    }

    const participation = await Participation.findOne({
      session: sessionId,
      user: req.user._id,
    });

    if (!participation) {
      return res.status(404).json({
        message: "Participation not found",
      });
    }

    participation.leftAt = new Date();

    await participation.save();

    res.json({
      message: "Left session successfully",
      participation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to leave session",
      error: error.message,
    });
  }
};

// Get participants of a session
const getSessionParticipants = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

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

    const participants = await Participation.find({
      session: req.params.sessionId,
    })
      .populate("user", "name email")
      .sort({ joinedAt: 1 });

    res.json(participants);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch participants",
      error: error.message,
    });
  }
};

module.exports = {
  joinSession,
  submitCheckIn,
  leaveSession,
  getSessionParticipants,
};