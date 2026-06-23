const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // Check cookie first, then auth header fallback
  const token = req.cookies?.token || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

module.exports = auth;
