
// const jwt = require("jsonwebtoken");
// const User = require("../models/User")

// const authMiddleware =async (req, res, next) => {
//   try {
//     // authorization header 
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         message: "Access denied. Token missing.",
//       });
//     }
//       // token 
//     const token = authHeader.split(" ")[1];
//     if(!token){
//       return res.status(401).json({success:false,message:"authrozation token is required."})
//     }

//     // jwt screate check 
//     if (!process.env.JWT_SECRET) {
//       console.error("JWT_SECRET is missing in .env");
//       return res.status(500).json({
//         message: "Server authentication configuration error.",
//       });
//     }
//     // jwt verify 
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // login 
//     const userId = decoded.id || decoded._id || decoded.userId;
//     if(!userId){
//       return res.status(401).json({
//         success:false,
//         messange:"invaild token payload."
//       })
//     }

//     // mongooseDB user get
//  const user = await User.findById(userId).select("-password");
//  if(!user){return res.status(401).json({success:false,messange:"user not found.plase login agin."})}    

//  req.user={id:user._id.toString(),role:user.role,name:user.name,email:user.email,}

//     // req.user = {
//     //   id: decoded.id,
//     //   role: decoded.role,
//     // };

//     // if (!req.user.id) {
//     //   return res.status(401).json({
//     //     message: "Invalid token payload.",
//     //   });
//     // }

//     next();
//   } catch (error) {
//     console.error("JWT verification error:", error.message);
// if(error.name === "TokenExpiredError"){
//   return res.status(401).json({

//     success:false,messange:"token expire.plaese login again",
//   })
// }
// if(error.name ==="jsonWebTokenError"){
//   return res.status(401).json({success:false,messange:"invaild authrozation token."})
// }

// return res.status(500).json({success:false,messange:"authentication failed."})
// };
// }

// module.exports = authMiddleware;


const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const user = await User.findById(userId)
      .select("_id name email role isActive manager");

    if (!user || !user.isActive) {
      return res.status(401).json({
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
      manager: user.manager,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
