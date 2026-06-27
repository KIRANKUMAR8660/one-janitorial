export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role) && req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
