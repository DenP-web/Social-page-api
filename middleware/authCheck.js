const { createErrorResponse } = require("../utils/createError");
const errorMessages = require("../utils/errorMessages");
const jwt = require("jsonwebtoken");

/**
 * Middleware to check authentication using JWT.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - JSON error response or proceeds to the next middleware.
 */
const authCheck = (req, res, next) => {
  const token = req.cookies.token;
  if (req.path === "/" && req.method === "GET" && !token) {
    return next();
  }

  // Check if the token is missing
  if (!token) {
    return createErrorResponse(res, 401, errorMessages.missingToken);
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return createErrorResponse(res, 401, "Invalid token");
    }
    // Token is valid, attach the user to the request object
    req.user = user;
    next();
  });
};

module.exports = authCheck;
