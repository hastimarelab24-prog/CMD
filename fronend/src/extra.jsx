const AuditLog = require("../models/AuditLog"); // Tari AuditLog model file nu path check kari levo

const logAction = async (req, action, entity, entityId, details) => {
  try {
    // Request mathi login tharela user ni ID melvo
    const actorId = req && req.user ? (req.user.id || req.user._id) : null;

    await AuditLog.create({
      actor: actorId, // Aa user ID save thase je pachhi populate thai sake
      action: action,
      entity: entity,
      entityId: entityId,
      details: { message: details }
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = logAction;