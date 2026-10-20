const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Lead = require("../models/lead");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getLeads,
  createLead,
  updatedLead,
  transitionStatus,
  deleteLead,
} = require("../controllers/leadController");

const logActive = require("../until/auditLogger");

// Require login for all lead routes.
router.use(authMiddleware);

// View and create leads.
// Controller must also enforce record-level permissions.
router.route("/").get(getLeads).post(createLead);

// Update and delete a lead.
// Add ownership/role checks inside these controllers.
router.route("/:id").put(updatedLead).delete(deleteLead);

// Change lead status.
router.patch("/:id/status", transitionStatus);

// Assign a lead to an active employee.

router.patch(
  "/:id/assign",
  allowRoles("administrator", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;

      if (
        !mongoose.isValidObjectId(id) ||
        !mongoose.isValidObjectId(employeeId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid lead ID or employee ID.",
        });
      }

      const employee = await User.findOne({
        _id: employeeId,
        role: "employee",
        isActive: { $ne: false },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Active employee not found.",
        });
      }

      const lead = await Lead.findById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found.",
        });
      }

      const previousEmployee =
        lead.assignedEmployee?.toString() || null;

      lead.assignedEmployee = employee._id;
      await lead.save();

      try {
        await logActive(
          req.user.id || req.user._id,
          "LEAD_ASSIGNED",
          "Lead",
          lead._id.toString(),
          {
            previousEmployee,
            newEmployee: employee._id.toString(),
          }
        );
      } catch (auditError) {
        // Lead assignment is already saved.
        console.error("Audit log error:", auditError);
      }

      return res.status(200).json({
        success: true,
        message: "Lead assigned successfully.",
        lead,
      });
    } catch (error) {
      console.error("Assign lead error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to assign lead.",
        error: error.message,
      });
    }
  }
);


module.exports = router;
