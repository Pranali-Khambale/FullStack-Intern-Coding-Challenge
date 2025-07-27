// backend/src/middlewares/roleMiddleware.js
module.exports = (roles) => {
  return (req, res, next) => {
    // req.user is populated by authMiddleware
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user role found." });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: "Forbidden: You do not have the required permissions.",
        });
    }
    next();
  };
};
