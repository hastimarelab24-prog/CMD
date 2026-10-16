// const mongoose = require('mongoose');

// const UserSchema= new mongoose.Schema({
//     name:{type:String,required:true},email:{type:String,require:true,unique:true},
//     password:{type:String,required:true}
// },{timestamps:true});

// // save before passwword 
// UserSchema.pre('save',async function (next){
//     if(!this.isModified('password')) return next();
//     try{
//         const salt =await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password,salt);
//         next();
//     }catch(err){
//         next(err)
//     }
// })
// // password method
// UserSchema.method.comparePassword = async function  (enteredPassword) {
//     return await bcrypt.compare(enteredPassword,this.password)
// }

// module.exports = mongoose.model('User',UserSchema)


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["administrator", "manager", "employee"],
      default: "employee",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password once when it is created or changed.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
