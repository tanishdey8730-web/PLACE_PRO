import expressRateLimit from "express-rate-limit";

export const rateLimit = expressRateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." },
});

export const authRateLimit = expressRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many auth attempts." },
});
