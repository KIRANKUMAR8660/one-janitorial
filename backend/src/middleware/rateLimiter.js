import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const recoveryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 recovery attempts per windowMs to support test runs
  message: {
    message: 'Too many password recovery requests from this IP. Please try again after 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
