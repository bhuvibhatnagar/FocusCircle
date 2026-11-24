const Goal = require("../models/Goal");
const Session = require("../models/Session");
const Participation = require("../models/Participation");

// Get personal analytics
const getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Completed goals
    const completedGoals = await Goal.countDocuments({
      owner: userId,
      completed: true,
    });

    // Total goals
    const totalGoals = await Goal.countDocuments({
      owner: userId,
    });

    // User participation records
    const participations = await Participation.find({
      user: userId,
    }).populate("session");

    // Total sessions joined
    const totalSessions = participations.length;

    // Total study time in seconds
    let totalStudyTime = 0;

    participations.forEach((participation) => {
      if (participation.session && participation.session.duration) {
        totalStudyTime += participation.session.duration;
      }
    });

    // Number of check-ins
    const totalCheckIns = await Participation.countDocuments({
      user: userId,
      checkIn: true,
    });

    // Recent sessions
    const recentSessions = await Participation.find({
      user: userId,
    })
      .populate({
        path: "session",
        populate: {
          path: "room",
          select: "name code",
        },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      summary: {
        totalGoals,
        completedGoals,
        totalSessions,
        totalCheckIns,
        totalStudyTime,
        totalStudyTimeMinutes: Math.floor(totalStudyTime / 60),
        totalStudyTimeHours: Number(
          (totalStudyTime / 3600).toFixed(2)
        ),
      },
      recentSessions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getMyAnalytics,
};
