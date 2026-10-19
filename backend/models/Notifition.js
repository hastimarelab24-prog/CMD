const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    followUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowUp",
      required: true,
    },

    type: {
      type: String,
      enum: ["upcoming", "overdue", "completed", "assigned"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// એક જ task માટે એક જ પ્રકારની duplicate notification અટકાવે.
notificationSchema.index(
  { user: 1, followUp: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);