const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    
    const con = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected successfully:${con.connection.host}`);
  } catch (error) {
    console.error(`database connection failed:, ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;