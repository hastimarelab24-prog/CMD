// const jwt= require('jsonwebtoken');
// const authMiddleware= (req,res,next)=>{
//     const authHeader = req.header('Authorization');
//     if(!authHeader || !authHeader.startWith('Bearer')){
//         return res.status(401).json({message:'No secure token received, permission denied.'})
//     }
//     const token = authHeader.split('')[1];
//     try{
//         const decoded = jwt.verify(token,process.env.JWT_SECRET || 'my_super_secret_key');
//         req.user = decoded;
//         next();
//     }catch(err){
//         res.status(401).json({message:'this token invalid or has expired. '})
//     }
// }
// module.exports= authMiddleware

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return res.status(500).json({
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    if (!req.user.id) {
      return res.status(401).json({
        message: "Invalid token payload.",
      });
    }

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
