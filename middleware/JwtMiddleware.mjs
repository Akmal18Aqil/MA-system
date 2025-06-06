import { verifyAccessToken } from '../utils/jwt.mjs';
import { AuthenticationError, AuthorizationError } from '../utils/error.mjs';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

  if (token == null) {
    return next(new AuthenticationError('Token tidak ditemukan')); // No token provided
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.role = decoded.role; // Attach role from token payload
    next(); // Token is valid, proceed to the next middleware/route handler
  } catch (err) {
    // Token is invalid (e.g., expired, wrong signature)
    next(new AuthenticationError('Token tidak valid atau kadaluarsa'));
  }
};

export const adminOnly = (req, res, next) => {
  // This middleware assumes verifyToken has already run and attached req.role
  if (!req.role || req.role !== "admin") {
    return next(new AuthorizationError('Hanya admin yang bisa mengakses resource ini'));
  }
  next(); // User is admin, proceed
};