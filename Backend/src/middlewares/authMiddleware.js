const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization");

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token
    // Expected format: "Bearer TOKEN_STRING"
    const tokenString = token.split(" ")[1];
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

    // Attach user to the request object
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
