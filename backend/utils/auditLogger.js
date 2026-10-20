
const AuditLog = require("../models/AuditLog");

async function auditLogger(
  actor,
  action,
  entity,
  entityId = "",
  details = {}
) {
  try {
    return await AuditLog.create({
      actor: actor || null,
      action,
      entity,
      entityId: entityId ? String(entityId) : "",
      details,
    });
  } catch (error) {
    console.error("Audit log creation failed:", error.message);
    return null;
  }
}

module.exports = auditLogger;
