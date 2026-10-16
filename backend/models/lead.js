const mongoose = require('mongoose');
const { lowercase } = require('zod');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true,trim:true, },
  company: { type: String, default: '',trim:true, },
  email: { type: String, required: true, unique: true ,lowercase:true,trim:true,},
  phone: { type: String, default: '' ,trim:true,},
  source: { 
    type: String, 
    required: true,
    lowercase: true, // Automatically casts strings to lowercase inside MongoDB
    enum: ['website', 'referral', 'cold outreach', 'inbound call', 'social media']
  },
  status: { 
    type: String, 
    required: true,
    lowercase: true, // Automatically casts strings to lowercase inside MongoDB
    enum: ['new', 'contacted', 'qualified', 'proposal sent', 'nurturing', 'lost', 'won'],
    default: 'new'
  },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref:"User",required: true },
}, { timestamps: true });

// 💡 CRITICAL: Ensure the name is defined as singular 'Lead' to match controllers
module.exports = mongoose.model('Lead', LeadSchema);
