// const mongoose = require('mongoose');
// const LeadSchema = new mongoose.Schema({
//     name:{type:String,required:true,trim:true},
//     comapany:{type:String,trim:true},
//     email:{type:String,required:true,unique:true,trim:true,lowercase:true},
//     phone:{type:String,trim:true},
//     source:{type:String,required:true,enum:["Website","cold Outreach","Inbound call","social Media"]},
//     status:{type:String,required:true,enum:["new","contacted","Qualified","Proposal Sent","Nurturing","Lost","Won",],default:"New"},
//     assignedEmployee:{type:String,required:true,trim:true},

// },{timestamps:true})
// LeadSchema.index({name:"text",comapany:"text",email:"text"});
// module.exports = mongoose.model("lead",LeadSchema);

const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
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
  assignedEmployee: { type: String, required: true }
}, { timestamps: true });

// 💡 CRITICAL: Ensure the name is defined as singular 'Lead' to match controllers
module.exports = mongoose.model('Lead', LeadSchema);
