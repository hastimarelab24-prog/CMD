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
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// 🔒 FIXED: Removed the 'next' parameter callback from the async hook block
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // 💡 With async/await pre-save hooks, returning completes the middleware cycle automatically!
  } catch (err) {
    throw err; // Throws the error up directly into your centralized catch block safely
  }
});

// Structural helper method to decode and verify passwords during a sessional login request
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
