const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const {getLeads,createLead,updatedLead,transitionStatus,deleteLead}=require('../controllers/leadController');
const allowRoles = require('../middleware/roleMiddleware');
const { default: mongoose } = require('mongoose');
const logActive = require('../until/auditLogger');
router.route('/').get(getLeads).post(createLead);
router.route('/:id').put(authMiddleware,updatedLead).delete(authMiddleware,deleteLead);
router.patch('./:id/status',authMiddleware,transitionStatus);
router.patch("./:id/assign",authMiddleware,allowRoles("administrator","manger"),async(req,res)=>{
    try{
        const {employeeId} = req.body;
        if(!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(employeeId)){
            return res.status(400).json({message:"invalid lead or employee id"})
        }
        const employee = await User.findOne({_id:employeeId,role:"employee",isActive:true,})
        if(!employee){
            return res.status(400).json({message:"select an active employee"})
        }
        const lead = await Lead.findById(req.params.id)
        if(!lead){return res.status(404).json({message:"lead not found"})}

        const previousEmployee = lead.assignedTo?lead.assignedTo.toString():null;
        lead.assignedTo = employee._id;
        await lead.save();
        await logActive(req.user._id),"LEAD_ASSIGNED","LEAD",lead._id.toString(),
        {
            previousEmployee,newEmploye:employee._id.toString(),
        }
        res.json({message:"lead assigned successfully",lead,})
    }catch(err){
        res.status(500).json({mesage:"failed to assig lead."})
    }
})
module.exports = router;