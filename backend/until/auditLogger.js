
const AuditLog = require("../models/AuditLog");

const logAction = async (
  userId,
  action,
  entity,
  entityId,
  details = {}
) => {
  try{
 return AuditLog.create({
    user: userId,
    action,
    entity,
    entityId,
    details,
  });
  }catch(err){
    console.error("auditilog creation failed",err);
    throw err;
  }
 
};

module.exports = logAction;
