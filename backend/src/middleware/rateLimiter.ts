import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many login or registration attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for public license verification endpoints
export const verificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 queries per minute
  message: {
    success: false,
    error: 'Public license verification rate limit exceeded. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
