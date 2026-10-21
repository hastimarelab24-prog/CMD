const  mongoose  = require("mongoose");


const authUserSchema = new mongoose.Schema(
    {
        name:{
            type:String,required:true,trim:true,
        },
        email:{
            type:String, required:true,unique:true,lowercase:true,trim:true,
        },
        password:{
            type:String,required:true,select:false,
        },
        role:{
            type:String,enum:["adminstrator","manger","employee"],default:"empolyee"
        },
        isActive:{
            type:Boolean,default:true,
        }
    },
    {timestamps:true}
)
module.exports = mongoose.model.AuthUser || mongoose.model(
  "AuthUser",authUserSchema
);
