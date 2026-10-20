
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Lead = require("../models/lead");
const FollowUp = require("../models/FollowUp");
const User = require("../models/User");

let AuditLog = null;

try {
  AuditLog = require("../models/AuditLog");
} catch (error) {
  console.warn("AuditLog model is unavailable.");
}

router.use(authMiddleware);

function getUserId(req) {
  return req.user?._id || req.user?.id || req.user?.userId;
}

function getRole(req) {
  return String(req.user?.role || "").toLowerCase();
}

function findPath(Model, candidates) {
  return candidates.find((path) => Model.schema.path(path));
}

function buildOwnerFilter(Model, userId, isAdminOrManager) {
  if (isAdminOrManager) return {};

  const ownerPath = findPath(Model, [
    "assignedEmployee",
    "assignedTo",
    "assignedUser",
    "owner",
    "createdBy",
    "user",
  ]);

  if (!ownerPath) {
    throw new Error(
      `No ownership field found in ${Model.modelName}. ` +
      "Configure the correct employee ownership field."
    );
  }

  return { [ownerPath]: userId };
}

router.get("/overview", async (req, res) => {
  try {
    const userId = getUserId(req);
    const role = getRole(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID is missing.",
      });
    }

    const isAdminOrManager = [
      "administrator",
      "manager",
    ].includes(role);

    const leadFilter = buildOwnerFilter(
      Lead,
      userId,
      isAdminOrManager
    );

    const followUpFilter = buildOwnerFilter(
      FollowUp,
      userId,
      isAdminOrManager
    );

    const leadStatusPath = findPath(Lead, ["status"]);
    const dueDatePath = findPath(FollowUp, [
      "dueDate",
      "dueAt",
      "scheduledAt",
      "date",
    ]);

    if (!leadStatusPath) {
      throw new Error("Lead model has no status field.");
    }

    if (!dueDatePath) {
      throw new Error(
        "FollowUp model has no recognized due-date field."
      );
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const completionPath = findPath(FollowUp, [
      "status",
      "completionStatus",
    ]);

    const completedPath = findPath(FollowUp, [
      "completed",
      "isCompleted",
    ]);

    const todayFilter = {
      ...followUpFilter,
      [dueDatePath]: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (completionPath) {
      todayFilter[completionPath] = {
        $nin: ["completed", "cancelled", "canceled"],
      };
    } else if (completedPath) {
      todayFilter[completedPath] = { $ne: true };
    }

    const [
      totalLeads,
      recentLeads,
      statusGroups,
      followUpsToday,
      users,
      recentActivities,
    ] = await Promise.all([
      Lead.countDocuments(leadFilter),

      Lead.find(leadFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Lead.aggregate([
        { $match: leadFilter },
        {
          $group: {
            _id: `$${leadStatusPath}`,
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      FollowUp.find(todayFilter)
        .sort({ [dueDatePath]: 1 })
        .limit(10)
        .lean(),

      isAdminOrManager
        ? User.find({ isActive: { $ne: false } })
            .select("name email role")
            .lean()
        : User.find({ _id: userId })
            .select("name email role")
            .lean(),

      AuditLog
        ? AuditLog.find(
            isAdminOrManager ? {} : { user: userId }
          )
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
        : Promise.resolve([]),
    ]);

    const leadStatus = statusGroups.map((item) => ({
      status: item._id || "unknown",
      count: item.count,
    }));

    const wonStatuses = ["won"];

    const convertedLeads = leadStatus
      .filter((item) =>
        wonStatuses.includes(
          String(item.status).toLowerCase()
        )
      )
      .reduce((sum, item) => sum + item.count, 0);

    const teamPerformance = await Promise.all(
      users.map(async (member) => {
        const memberLeadFilter = {
          ...leadFilter,
        };

        const ownerPath = findPath(Lead, [
          "assignedEmployee",
          "assignedTo",
          "assignedUser",
          "owner",
          "createdBy",
          "user",
        ]);

        if (ownerPath) {
          memberLeadFilter[ownerPath] = member._id;
        }

        const assignedLeads = await Lead.countDocuments(
          memberLeadFilter
        );

        const wonFilter = {
          ...memberLeadFilter,
          [leadStatusPath]: {
            $in: wonStatuses,
          },
        };

        const memberConvertedLeads =
          await Lead.countDocuments(wonFilter);

        return {
          userId: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          assignedLeads,
          convertedLeads: memberConvertedLeads,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        convertedLeads,
        recentLeads,
        leadStatus,
        teamPerformance,
        followUpsToday,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard.",
    });
  }
});

module.exports = router;
