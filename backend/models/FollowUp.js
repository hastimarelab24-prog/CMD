
const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead is required"],
      index: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assignee is required"],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },

    type: {
      type: String,
      enum: ["call", "email", "meeting", "task"],
      required: [true, "Type is required"],
      default: "call",
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    reminderAt: {
      type: Date,
      default: null,
    },

    reminderSentAt: {
      type: Date,
      default: null,
    },

    activityHistory: [
      {
        action: {
          type: String,
          required: true,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        details: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

followUpSchema.index({ status: 1, dueDate: 1 });
followUpSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
followUpSchema.index({ lead: 1, createdAt: 1 });

module.exports = mongoose.model("FollowUp", followUpSchema);
