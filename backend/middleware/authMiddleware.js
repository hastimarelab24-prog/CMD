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



const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  // ✅ FIXED: Explicitly target index [1] to extract the raw token string
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key');
    req.user = decoded; // Attach user payload configuration
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

module.exports = authMiddleware;
