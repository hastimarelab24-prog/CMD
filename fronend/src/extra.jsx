const role = String(req.user?.role || "").toLowerCase();
const userId = req.user?._id || req.user?.id || req.user?.userId;

if (!userId) {
  return res.status(401).json({
    success: false,
    message: "User ID not found in authentication token.",
  });
}

let leadFilter = {};

if (role === "employee") {
  leadFilter = { assignedEmployee: userId };
} else if (role === "administrator" || role === "manager") {
  leadFilter = {};
} else {
  return res.status(403).json({
    success: false,
    message: "Unauthorized role.",
  });
}

const totalLeads = await Lead.countDocuments(leadFilter);

const recentLeads = await Lead.find(leadFilter)
  .populate("assignedEmployee", "name email role")
  .sort({ createdAt: -1 })
  .limit(5)
  .lean();

const leadStatus = await Lead.aggregate([
  { $match: leadFilter },
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1 } },
]);

const convertedLeads = await Lead.countDocuments({
  ...leadFilter,
  status: "won",
});