exports.getFollowUps = async (req, res) => {
  try {
    const filter = {};

    // જો ફ્રન્ટએન્ડથી સ્ટેટસ મોકલ્યું હોય તો ફિલ્ટર કરો
    if (req.query.status && req.query.status.trim() !== "") {
      filter.status = new RegExp(`^${req.query.status}$`, "i");
    }

    const now = new Date();

    if (req.query.view === "upcoming") {
      filter.status = { $in: ["pending", "Pending"] };
      filter.dueDate = { $gte: now };
    } else if (req.query.view === "overdue") {
      filter.status = { $in: ["pending", "Pending"] };
      filter.dueDate = { $lt: now };
    } else if (req.query.view === "completed") {
      filter.status = { $in: ["completed", "Completed"] };
    }

    const followUps = await FollowUp.find(filter)
      .populate("lead", "name company email assignedEmployee")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 })
      .lean();

    return res.json({ success: true, followUps });
  } catch (error) {
    console.error("Get follow-ups error:", error);
    return res.status(500).json({ success: false, message: "Failed to load follow-ups." });
  }
};