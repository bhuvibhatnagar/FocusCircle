const Room = require("../models/Room");

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a room
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Room name is required",
      });
    }

    let code;
    let existingRoom;

    do {
      code = generateRoomCode();

      existingRoom = await Room.findOne({ code });
    } while (existingRoom);

    const room = await Room.create({
      name,
      code,
      owner: req.user._id,
      members: [req.user._id],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create room",
      error: error.message,
    });
  }
};

// Get rooms of logged-in user
const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id,
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
};

// Join a room using code
const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Room code is required",
      });
    }

    const room = await Room.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const alreadyMember = room.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "You are already a member of this room",
      });
    }

    room.members.push(req.user._id);

    await room.save();

    const populatedRoom = await Room.findById(room._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    res.json({
      message: "Joined room successfully",
      room: populatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to join room",
      error: error.message,
    });
  }
};

// Get one room
const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      members: req.user._id,
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!room) {
      return res.status(404).json({
        message: "Room not found or access denied",
      });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch room",
      error: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getMyRooms,
  joinRoom,
  getRoom,
};