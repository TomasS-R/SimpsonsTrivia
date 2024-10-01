const RoleManager = require('../roles/rolesManager');

function checkRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    //if (!RoleManager.canAssignRole(req.user.role, requiredRole)) {
    const userRole = req.user.role;

    if (RoleManager.getRoleHierarchy(userRole) >= RoleManager.getRoleHierarchy(requiredRole)) {
        next();
    } else {
        res.status(403).json({ success: false, error: "Access denied. Insufficient permissions." });
    }
  };
}

module.exports = { checkRole };