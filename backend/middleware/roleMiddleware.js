

// const allowRole = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         message: "Authentication required.",
//       });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: "Access denied. Insufficient permissions.",
//       });
//     }

//     next();
//   };
// };

// module.exports = allowRole;



module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const role = String(req.user.role || "").toLowerCase();

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};
