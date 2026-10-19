const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notifition");

router.use(authMiddleware);

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    })
      .populate("followUp", "title dueDate status priority")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
});

module.exports = router;