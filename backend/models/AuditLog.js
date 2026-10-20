const mongoose = require("mongoose");
const audiLogSchem = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true,},
    active:{type:String,required:true,trim:true},
    entity:{type:String,required:true,trim:true,},
    entityId:{type:String,default:null},
    details:{type:mongoose.Schema.Types.Mixed,default:{}},
    // details:{type:String,default:""},
    resource:{type:String,default:""},
},{timestamps:true})
module.exports =
//  mongoose.module.AuditLog || 
                mongoose.model('AuditLog', audiLogSchem);