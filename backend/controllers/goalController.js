const Goal = require("../models/Goal");

// Get all goals for logged-in user
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(goals);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch goals",
      error: error.message,
    });
  }
};

// Create a goal
const createGoal = async (req, res) => {
  try {
    const { title, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Goal title is required",
      });
    }

    const goal = await Goal.create({
      owner: req.user._id,
      title,
      targetDate: targetDate || null,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create goal",
      error: error.message,
    });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    const { title, targetDate, completed } = req.body;

    if (title !== undefined) goal.title = title;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (completed !== undefined) goal.completed = completed;

    await goal.save();

    res.json(goal);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update goal",
      error: error.message,
    });
  }
};

// Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete goal",
      error: error.message,
    });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};