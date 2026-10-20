
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose")

const logAction = async (
  userId,
  action,
  entity,
  entityId,
  details = {}
) => {
  try{
    if(!userId || !mongoose.isValidObjectId(userId)){
      throw new Error("a valid user id is required for audit logging.");
      
    }
    if(!action || !entity){
      throw new Error("audit action and entity are required");
      
    }
    const log = await AuditLog.create({user:userId,action,entity,entityId:entityId?String(entityId):null,details,})
//  return AuditLog.create({
//     user: userId,
//     action,
//     entity,
//     entityId,
//     details,
//   });
return log;
  }catch(err){
    console.error("auditilog creation failed",err);
    throw err;
  }
 
};

module.exports = logAction;
