



const { success } = require("zod");
const jwt = require("jsonwebtoken");
const AuthUser = require("../models/AuthUser");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token missing. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];
    if(!process.env.JWT_SECRET){
      console.error("JWT_SCERET is missing in env");
    return res.status(500).json({
      success:false,messange:"Authrozation configurstion error"
    })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user= await AuthUser.findById(decoded.id).select("-password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }


    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User not found or account disabled.",
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
     
    };

    next();
  } catch (error) {
    console.error("authentication middleware error",error.message);
    
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
