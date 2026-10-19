

const allowRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = allowRole;
