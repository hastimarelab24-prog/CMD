const mongoose = require("mongoose");
const audiLogSchem = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true,},
    active:{type:String,required:true,},
    entity:{type:String,required:true},
    entityId:{type:String,default:null},
    details:{type:mongoose.Schema.Types.Mixed,default:{}}
},{timestamps:true})
module.exports = mongoose.model('AuditLog', audiLogSchem);