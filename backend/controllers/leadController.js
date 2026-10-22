// const { default: mongoose } = require('mongoose');
// const Lead = require('../models/lead');
// const { z, success } = require('zod');

// //  Strict type validation template matrix
// const leadSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   company: z.string().optional().or(z.literal('')),
//   email: z.string().email('Invalid email format'),
//   phone: z.string().optional().or(z.literal('')),
//   source: z.enum(['website', 'referral', 'cold outreach', 'inbound call', 'social media']),
//   status: z.enum(['new', 'contacted', 'qualified', 'proposal sent', 'nurturing', 'lost', 'won']),
//   assignedEmployee: z.string().min(2, "Employee name is required")
// });

// const isValidTransition = (current, next) => {
//   const chart = {
//     'new': ['contacted', 'lost'],
//     'contacted': ['qualified', 'nurturing', 'lost'],
//     'qualified': ['proposal sent', 'lost', 'won'],
//     'proposal sent': ['nurturing', 'lost', 'won'],
//     'nurturing': ['contacted', 'qualified', 'lost'],
//     'lost': [], 'won': []
//   };
//   return current === next || chart[current]?.includes(next);
// };

// //  1. Get Leads Pipeline
// const getLeads = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, search, status, source, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
//     const query = {};
   
// if (search) {
//   const searchRegex = {
//     $regex: search,
//     $options: "i",
//   };

//   query.$or = [
//     { name: searchRegex },
//     { company: searchRegex },
//     { email: searchRegex },
//   ];
// }
    
//     if (status) query.status = status.toLowerCase();
//     if (source) query.source = source.toLowerCase();

//     const count = await Lead.countDocuments(query);
//     const skip = (Number(page) - 1) * Number(limit);

//     const leads = await Lead.find(query)
//       .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
//       .skip(skip)
//       .limit(Number(limit));

//     res.status(200).json({
//       leads,
//       pagination: {
//         totalItems: count,
//         totalPages: Math.ceil(count / Number(limit)),
//         currentPage: Number(page)
//       }
//     });
//   } catch (error) { next(error); }
// };

// // 2. Create Lead Pipeline

// // const createLead = async (req, res, next) => {
// //   try {
// //     console.log("Create Lead Request:", req.body);

// //     const payload = {
// //       ...req.body,
// //       name: req.body.name?.trim(),
// //       email: req.body.email?.trim().toLowerCase(),
// //       company: req.body.company?.trim() || "",
// //       phone: req.body.phone?.trim() || "",
// //       source: req.body.source?.trim().toLowerCase(),
// //       status: req.body.status?.trim().toLowerCase(),
// //       assignedEmployee: req.body.assignedEmployee?.trim(),
// //     };

// //     const result = leadSchema.safeParse(payload);

// //     if (!result.success) {
// //       return res.status(422).json({
// //         message: "Validation error",
// //         errors: result.error.issues.map((issue) => ({
// //           field: issue.path[0],
// //           message: issue.message,
// //         })),
// //       });
// //     }

// //     const emailExists = await Lead.findOne({
// //       email: payload.email,
// //     });

// //     if (emailExists) {
// //       return res.status(409).json({
// //         message: "Email address already exists",
// //         errors: [
// //           {
// //             field: "email",
// //             message: "Please use a different email address",
// //           },
// //         ],
// //       });
// //     }

// //     const lead = await Lead.create(result.data);

// //     return res.status(201).json({
// //       message: "Lead created successfully",
// //       lead,
// //     });
// //   } catch (error) {
// //     console.error("CREATE LEAD ERROR:", error);
// //     next(error);
// //   }
// // };

// exports.createLead=async(req,res)=>{
//   try{
//     const{name,email,phone,company,status,source,assignedEmployee}=req.body;
//     if(!name || !name.trim() || !email || !email.trim()){
//       return res.status(400).json({
//         success:false,
//         message:"new and email are required"
//       })
//     }
//     let vaildAssignee = null;
//     if(assignedEmployee && mongoose.Types.ObjectId.isValid(assignedEmployee)){
//       vaildAssignee = assignedEmployee;
//     } else if(req.user && req.user.id){
//       vaildAssignee = req.user.id;
//     }
//     const lead = await Lead.create({
//       name:name.trim(),email:email.trim().toLowerCase(),
//       phone:phone?.trim() || "",company:company?.trim() || "",
//       status:status || "new", source:source || "website",
//       assignedEmployee:vaildAssignee, createdBy:req.user? req.user.id || req.user._id :null,
//     })
//     return res.status(201).json({
//       success:true, messange:"lead created successfully",lead,
//     })
//   }catch(error){
// console.error("create lead error stack",error);
// return res.status(500).json({
//   success:false,messange:error.message || "internal server error"
// })

//   }
// }

// //  3. Update Lead Profile Pipeline
// const updatedLead = async (req, res, next) => {
//   try {
//     if (req.body.status) req.body.status = req.body.status.toLowerCase();
//     if (req.body.source) req.body.source = req.body.source.toLowerCase();

//     const result = leadSchema.safeParse(req.body);
//     if (!result.success) {
//       return res.status(422).json({ 
//         message: 'Validation error', 
//         errors: result.error.errors.map(e => ({ field: e.path[0], message: e.message })) 
//       });
//     }

//     const lead = await Lead.findById(req.params.id);
//     if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
//     if (req.body.email && req.body.email !== lead.email) {
//       const emailExists = await Lead.findOne({ email: req.body.email });
//       if (emailExists) {
//         return res.status(400).json({ 
//           message: 'Conflict error', 
//           errors: [{ field: 'email', message: 'Email already tied to another record' }] 
//         });
//       }
//     }
//     const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(updatedLead);
//   } catch (error) { next(error); }
// };

// // 🔒 4. Lead Status Machine Rule Transition Pipeline
// const transitionStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
    
//     const lead = await Lead.findById(id);
//     if (!lead) return res.status(404).json({ message: 'Lead profile missing' });
    
//     const normalizedNextStatus = status.toLowerCase();
//     if (!isValidTransition(lead.status, normalizedNextStatus)) {
//       return res.status(400).json({ message: `Invalid status transition rule from ${lead.status} to ${normalizedNextStatus}` });
//     }
//     lead.status = normalizedNextStatus;
//     await lead.save();
//     res.status(200).json(lead);
//   } catch (error) { next(error); }
// };

// //  5. Delete Lead Profile Pipeline

    
// const deleteLead = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         message: "Lead ID is required",
//       });
//     }

//     const deletedLead = await Lead.findByIdAndDelete(id);

//     if (!deletedLead) {
//       return res.status(404).json({
//         message: "Lead not found",
//       });
//     }

//     return res.status(200).json({
//       message: "Lead deleted successfully",
//       id: deletedLead._id,
//     });
//   } catch (error) {
//     console.error("DELETE LEAD ERROR:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         message: "Invalid lead ID",
//       });
//     }

//     return res.status(500).json({
//       message: "Failed to delete lead",
//     });
//   }
// };




// module.exports = { getLeads, createLead, updatedLead, transitionStatus, deleteLead };


const mongoose = require("mongoose");
const Lead = require("../models/lead");
const User = require("../models/TeamUser");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. GET ALL LEADS
exports.getLeads = async (req, res) => {
  try {
    let filter = {};
    const { search, status } = req.query;

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status.trim() !== "") {
      filter.status = status;
    }

    const leads = await Lead.find(filter)
      .populate("assignedEmployee", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ 
      success: true, 
      count: leads.length,
      leads 
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to load leads." });
  }
};
// 2. CREATE LEAD
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, company, status, source, assignedEmployee } = req.body;

    if (!name || !name.trim() || !email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }
    const formattedStatus = status?status.charAt(0).toUpperCase() + status.slice(1).toLowerCase():"New";

    let validAssignee = null;
    if (assignedEmployee && mongoose.Types.ObjectId.isValid(assignedEmployee)) {
      validAssignee = assignedEmployee;
    } else if (req.user && req.user.id) {
      validAssignee = req.user.id;
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      company: company?.trim() || "",
      status: formattedStatus,
      source: source || "Website",
      assignedEmployee: validAssignee,
      createdBy: req.user ? (req.user.id || req.user._id) : null,
    });

    return res.status(201).json({ success: true, message: "Lead created successfully.", lead });
  } catch (error) {
    console.error("Create lead error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create lead." });
  }
};

// 3. UPDATE LEAD
exports.updatedLead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await Lead.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    return res.status(200).json({ success: true, message: "Lead updated successfully.", lead });
  } catch (error) {
    console.error("Update lead error:", error);
    return res.status(500).json({ success: false, message: "Failed to update lead." });
  }
};

// 4. TRANSITION LEAD STATUS
exports.transitionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validId(id)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    lead.status = status;
    await lead.save();

    return res.status(200).json({ success: true, message: "Lead status updated.", lead });
  } catch (error) {
    console.error("Transition status error:", error);
    return res.status(500).json({ success: false, message: "Failed to change lead status." });
  }
};

// 5. DELETE LEAD
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) {
      return res.status(400).json({ success: false, message: "Invalid lead ID." });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found." });
    }

    await lead.deleteOne();

    return res.status(200).json({ success: true, message: "Lead deleted successfully." });
  } catch (error) {
    console.error("Delete lead error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete lead." });
  }
};