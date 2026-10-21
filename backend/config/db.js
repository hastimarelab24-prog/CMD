const mongoose = require("mongoose");

const connectDB =async()=>{
  try{
    await mongoose.connect(
   process.env.MONGODB_URL||   "mongodb://127.0.0.1:27017/leadsphere",
    )
    console.log("mongoDb connection",mongoose.connection.name);
    
  }catch(error){
    console.error("MongoSb connection failed",error.messange);
    throw error;
    
  }


// crmConnection.on("connected", () => {
//   console.log("Connected to leadsphere database");
// });

// crmConnection.on("error", (error) => {
//   console.error("leadsphere database error:", error.message);
// });
}

module.exports = connectDB;
