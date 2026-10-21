
const mongoose = require("mongoose");

const authUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["administrator", "manager", "employee"],
      default: "employee",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

module.exports =
  mongoose.models.AuthUser ||
  mongoose.model("AuthUser", authUserSchema);
