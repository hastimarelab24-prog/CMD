const express = require("express")
const router = express.Router();
const mongoose =require("mongoose")

const authMiddleware = require("../middleware/authMiddleware");
const AuditLog = require("../models/AuditLog");
router.use(authMiddleware)

router.get("/", async(req,res)=>{
    try{
        const logs= await AuditLog.find({}).populate("user ","name email role.").sort({createdAt:-1}).limit(100).lean().exec();
        const formattedLogs = logs.map((log)=>({...log,action:log.action || log.active || "unknow action"}))
        return res.status(200).json({sucess:true,logs:formattedLogs, count:formattedLogs.length,})
    }catch(error){
        console.error("fetch audit logs error:",error);
        return res.status(500).json({messange:"failed to load audit logs.",
            // error:process.env.NODE_ENV === "production" ? undefined :error.messange,
            ...(process.env.NODE_ENV !=="production" ?{error:error.messange}:{}),
        })
    }
})
module.exports = router;