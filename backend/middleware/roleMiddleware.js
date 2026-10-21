
module.exports = (...allowedRoles) => {
  const normalizedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = String(req.user.role).trim().toLowerCase();

    if (!normalizedRoles.includes(userRole)) {
      console.log("Role access denied", {
        userId: req.user.id,
        actualRole: userRole,
        allowedRoles: normalizedRoles,
        path: req.originalUrl,
      });

      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    return next();
  };
};
