
const AuditLog = require("../models/AuditLog");

const logAction = async (
  userId,
  action,
  entity,
  entityId,
  details = {}
) => {
  return AuditLog.create({
    user: userId,
    action,
    entity,
    entityId,
    details,
  });
};

module.exports = logAction;
