// const mongoose = require("mongoose");
// const audiLogSchem = new mongoose.Schema({
//     user:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true,},
//     active:{type:String,required:true,trim:true},
//     entity:{type:String,required:true,trim:true,},
//     entityId:{type:String,default:null},
//     details:{type:mongoose.Schema.Types.Mixed,default:{}},
//     // details:{type:String,default:""},
//     resource:{type:String,default:""},
// },{timestamps:true})
// module.exports =
// //  mongoose.module.AuditLog || 
//                 mongoose.model('AuditLog', audiLogSchem);



const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      default: "",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
