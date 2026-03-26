// Role-Based Access Control Middleware

// Check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole('admin');

// Check if user is trader
const requireTrader = requireRole('trader');

// Check if user is customer
const requireCustomer = requireRole('customer');

// Check if user is admin or trader
const requireAdminOrTrader = requireRole('admin', 'trader');

// Check if trader is approved
const requireApprovedTrader = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required.' 
    });
  }

  if (req.user.role === 'trader' && !req.user.approved) {
    return res.status(403).json({ 
      success: false, 
      message: 'Your trader account is pending approval.' 
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireAdmin,
  requireTrader,
  requireCustomer,
  requireAdminOrTrader,
  requireApprovedTrader
};
