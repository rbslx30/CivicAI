/**
 * @desc Middleware to enforce department-specific access for department_admin roles.
 *       Super admins bypass this restriction.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const enforceDepartmentAccess = (req, res, next) => {
  // Super admins can see everything, so they bypass this middleware's restrictions.
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }

  // For department_admin, ensure they have an assigned department and filter their requests.
  if (req.user && req.user.role === 'department_admin') {
    if (!req.user.department) {
      return res.status(403).json({ success: false, message: 'Forbidden: Department admin has no assigned department.' });
    }
    // Attach the department to the request query, so controllers can use it to filter data.
    req.query.assignedDepartment = req.user.department;
  }
  next();
};

module.exports = enforceDepartmentAccess;