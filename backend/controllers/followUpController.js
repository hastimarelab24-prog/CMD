const mongoose = require("mongoose");
const FollowUp = require("../models/FollowUp");
const Lead = require("../models/lead");
const User = require("../models/User");

const VALID_TYPES = ["call", "email", "meeting", "task"];
const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_STATUSES = ["pending", "completed", "cancelled"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isManager = (role) => role === "administrator" || role === "manager";

const isAdmin = (role) => role === "administrator";

const sameId = (a, b) => String(a) === String(b);

const isTeamMember = async (userId, managerId) => {
  // તમારા User schema માં manager field ન હોય તો તેને
  // team membership schema/logic પ્રમાણે બદલો.
  const user = await User.findById(userId).select("manager");
  return user && sameId(user.manager, managerId);
};

const getLeadAccess = async (leadId, user) => {
  if (!isValidId(leadId)) return null;

  const lead = await Lead.findById(leadId);

  if (!lead) return null;

  if (isAdmin(user.role)) return lead;

  // તમારા Lead model માં assignedEmployee field છે.
  if (sameId(lead.assignedEmployee, user.id)) {
    return lead;
  }

  if (user.role === "manager") {
    const employee = await User.findById(lead.assignedEmployee).select(
      "manager",
    );

    if (employee && sameId(employee.manager, user.id)) {
      return lead;
    }
  }

  return null;
};

const canAccessFollowUp = async (followUp, user) => {
  if (isAdmin(user.role)) return true;

  if (sameId(followUp.assignedTo, user.id)) {
    return true;
  }

  if (sameId(followUp.createdBy, user.id)) {
    return true;
  }

  if (user.role === "manager") {
    return await isTeamMember(followUp.assignedTo, user.id);
  }

  return false;
};

const addHistory = (followUp, user, action, details = "") => {
  followUp.activityHistory.push({
    action,
    performedBy: user.id,
    details,
    createdAt: new Date(),
  });
};

// POST /api/follow-ups
exports.createFollowUp = async (req, res) => {
  try {
    const {
      lead,
      assignedTo,
      type,
      title,
      dueDate,
      priority,
      notes,
      reminderAt,
    } = req.body;

    if (!lead || !assignedTo || !title || !dueDate || !type) {
      return res.status(400).json({
        success: false,
        message: "Lead, assignee, title, type and due date are required.",
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up type.",
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority.",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date.",
      });
    }

    if (!isValidId(lead) || !isValidId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead or user ID.",
      });
    }

    const accessibleLead = await getLeadAccess(lead, req.user);

    if (!accessibleLead) {
      return res.status(403).json({
        success: false,
        message: "You cannot create activities for this lead.",
      });
    }

    const assignee = await User.findById(assignedTo);

    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found.",
      });
    }

    if (req.user.role === "employee" && !sameId(assignedTo, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Employees can assign follow-ups only to themselves.",
      });
    }

    if (req.user.role === "manager") {
      const isSelf = sameId(assignedTo, req.user.id);
      const isOwnTeam = await isTeamMember(assignedTo, req.user.id);

      if (!isSelf && !isOwnTeam) {
        return res.status(403).json({
          success: false,
          message: "You can assign follow-ups only to your team.",
        });
      }
    }

    let parsedReminderAt = null;

    if (reminderAt) {
      parsedReminderAt = new Date(reminderAt);

      if (Number.isNaN(parsedReminderAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid reminder date.",
        });
      }
    }

    const followUp = new FollowUp({
      lead,
      assignedTo,
      createdBy: req.user.id,
      type,
      title: title.trim(),
      dueDate: parsedDueDate,
      priority: priority || "medium",
      notes: notes || "",
      reminderAt: parsedReminderAt,
    });

    addHistory(
      followUp,
      req.user,
      "created",
      `Follow-up "${title.trim()}" created`,
    );

    await followUp.save();

    const populated = await FollowUp.findById(followUp._id)
      .populate("lead")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully.",
      followUp: populated,
    });
  } catch (error) {
    console.error("Create follow-up error:", error);

    return res.status(500).json({
      message: error.message || "Failed to create follow-up.",
    });
  }
};

// GET /api/follow-ups
exports.getFollowUps = async (req, res) => {
  try {
    const {
      status,
      priority,
      type,
      leadId,
      assignedTo,
      view,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (req.user.role === "employee") {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === "manager") {
      const team = await User.find({
        manager: req.user.id,
      }).select("_id");

      filter.assignedTo = {
        $in: [req.user.id, ...team.map((u) => u._id)],
      };
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter.",
        });
      }
      filter.status = status;
    }

    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority filter.",
        });
      }
      filter.priority = priority;
    }

    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type filter.",
        });
      }
      filter.type = type;
    }

    if (leadId) {
      if (!isValidId(leadId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lead ID.",
        });
      }

      const lead = await getLeadAccess(leadId, req.user);

      if (!lead) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this lead.",
        });
      }

      filter.lead = leadId;
    }

    if (assignedTo && isManager(req.user.role)) {
      if (!isValidId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assignee ID.",
        });
      }

      if (req.user.role === "manager") {
        const allowed =
          sameId(assignedTo, req.user.id) ||
          (await isTeamMember(assignedTo, req.user.id));

        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: "You cannot filter another team's tasks.",
          });
        }
      }

      filter.assignedTo = assignedTo;
    }

    const now = new Date();

    if (view === "upcoming") {
      filter.status = "pending";
      filter.dueDate = { $gte: now };
    } else if (view === "overdue") {
      filter.status = "pending";
      filter.dueDate = { $lt: now };
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

    const [followUps, total] = await Promise.all([
      FollowUp.find(filter)
        .populate("lead")
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email")
        .sort({ dueDate: 1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),

      FollowUp.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      followUps,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    console.error("Get follow-ups:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load follow-ups.",
    });
  }
};

// GET /api/follow-ups/upcoming
exports.getUpcoming = async (req, res, next) => {
  req.query.view = "upcoming";
  return exports.getFollowUps(req, res, next);
};

// GET /api/follow-ups/overdue
exports.getOverdue = async (req, res, next) => {
  req.query.view = "overdue";
  return exports.getFollowUps(req, res, next);
};

// GET /api/follow-ups/:id
exports.getFollowUpById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID.",
      });
    }

    const followUp = await FollowUp.findById(req.params.id)
      .populate("lead")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("activityHistory.performedBy", "name email");

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (!(await canAccessFollowUp(followUp, req.user))) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this follow-up.",
      });
    }

    const lead = await getLeadAccess(followUp.lead._id, req.user);

    if (!lead) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this lead.",
      });
    }

    return res.json({ success: true, followUp });
  } catch (error) {
    console.error("Get follow-up:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load follow-up.",
    });
  }
};

// PATCH /api/follow-ups/:id
exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (!(await canAccessFollowUp(followUp, req.user))) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this follow-up.",
      });
    }

    const lead = await getLeadAccess(followUp.lead, req.user);

    if (!lead) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this lead.",
      });
    }

    const isOwner = sameId(followUp.assignedTo, req.user.id);
    const isCreator = sameId(followUp.createdBy, req.user.id);

    // Employees may edit their own assigned tasks, but may not reassign.
    if (req.user.role === "employee") {
      if (!isOwner || req.body.assignedTo || req.body.lead) {
        return res.status(403).json({
          success: false,
          message: "You cannot reassign or change the lead for this task.",
        });
      }
    }

    const canManage = isAdmin(req.user.role) || req.user.role === "manager";

    const allowedFields = [
      "title",
      "type",
      "dueDate",
      "priority",
      "notes",
      "status",
      "assignedTo",
      "reminderAt",
    ];

    const changes = [];

    for (const key of allowedFields) {
      if (!(key in req.body)) continue;

      if (key === "assignedTo" && !canManage) {
        return res.status(403).json({
          success: false,
          message: "Only administrators and managers can reassign tasks.",
        });
      }

      if (key === "type" && !VALID_TYPES.includes(req.body.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type.",
        });
      }

      if (key === "priority" && !VALID_PRIORITIES.includes(req.body.priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority.",
        });
      }

      if (key === "status" && !VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status.",
        });
      }

      if (["dueDate", "reminderAt"].includes(key)) {
        if (req.body[key] === null && key === "reminderAt") {
          followUp[key] = null;
        } else {
          const date = new Date(req.body[key]);

          if (Number.isNaN(date.getTime())) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${key}.`,
            });
          }

          followUp[key] = date;
        }
      } else if (key === "assignedTo") {
        if (!isValidId(req.body.assignedTo)) {
          return res.status(400).json({
            success: false,
            message: "Invalid assignee ID.",
          });
        }

        const user = await User.findById(req.body.assignedTo);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Assignee not found.",
          });
        }

        if (req.user.role === "manager") {
          const allowed =
            sameId(user._id, req.user.id) ||
            (await isTeamMember(user._id, req.user.id));

          if (!allowed) {
            return res.status(403).json({
              success: false,
              message: "Assignee must belong to your team.",
            });
          }
        }

        followUp.assignedTo = user._id;
      } else {
        followUp[key] = req.body[key];
      }

      changes.push(key);
    }

    if ("status" in req.body) {
      if (req.body.status === "completed") {
        followUp.completedAt = new Date();
      } else {
        followUp.completedAt = null;
      }
    }

    if (changes.length > 0) {
      addHistory(
        followUp,
        req.user,
        "updated",
        `Updated fields: ${changes.join(", ")}`,
      );
    }

    await followUp.save();

    return res.json({
      success: true,
      message: "Follow-up updated successfully.",
      followUp,
    });
  } catch (error) {
    console.error("Update follow-up:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update follow-up.",
    });
  }
};

// PATCH /api/follow-ups/:id/complete
exports.completeFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (!(await canAccessFollowUp(followUp, req.user))) {
      return res.status(403).json({
        success: false,
        message: "You cannot complete this task.",
      });
    }

    const lead = await getLeadAccess(followUp.lead, req.user);

    if (!lead) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this lead.",
      });
    }

    if (followUp.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled tasks cannot be completed.",
      });
    }

    if (followUp.status !== "completed") {
      followUp.status = "completed";
      followUp.completedAt = new Date();

      addHistory(
        followUp,
        req.user,
        "completed",
        "Follow-up marked as completed",
      );

      await followUp.save();
    }

    return res.json({
      success: true,
      message: "Follow-up completed.",
      followUp,
    });
  } catch (error) {
    console.error("Complete follow-up:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete follow-up.",
    });
  }
};

// PATCH /api/follow-ups/:id/cancel
exports.cancelFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (!(await canAccessFollowUp(followUp, req.user))) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel this task.",
      });
    }

    if (
      req.user.role === "employee" &&
      !sameId(followUp.assignedTo, req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot cancel another member's task.",
      });
    }

    const lead = await getLeadAccess(followUp.lead, req.user);

    if (!lead) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this lead.",
      });
    }

    followUp.status = "cancelled";
    followUp.completedAt = null;

    addHistory(followUp, req.user, "cancelled", "Follow-up cancelled");

    await followUp.save();

    return res.json({
      success: true,
      message: "Follow-up cancelled.",
      followUp,
    });
  } catch (error) {
    console.error("Cancel follow-up:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel follow-up.",
    });
  }
};

// GET /api/follow-ups/lead/:leadId/history
exports.getLeadActivityHistory = async (req, res) => {
  try {
    const { leadId } = req.params;

    const lead = await getLeadAccess(leadId, req.user);

    if (!lead) {
      return res.status(403).json({
        success: false,
        message: "Lead not found or access denied.",
      });
    }

    const filter = { lead: leadId };

    if (req.user.role === "employee") {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === "manager") {
      const team = await User.find({
        manager: req.user.id,
      }).select("_id");

      filter.assignedTo = {
        $in: [req.user.id, ...team.map((u) => u._id)],
      };
    }

    const history = await FollowUp.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("activityHistory.performedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      leadId,
      total: history.length,
      history,
    });
  } catch (error) {
    console.error("Lead activity history:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load activity history.",
    });
  }
};

// DELETE /api/follow-ups/:id
// Soft delete: cancellation instead of permanent removal.
exports.deleteFollowUp = exports.cancelFollowUp;
