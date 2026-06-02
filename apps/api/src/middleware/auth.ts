import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma, type UserRole } from "@placepro/database";
import {
  DEMO_TOKEN,
  DEMO_USER,
  DEMO_RECRUITER_TOKEN,
  DEMO_RECRUITER_USER,
  isGuestUser,
  isRecruiterDemo,
} from "../demo/user.js";
import { AppError } from "./errorHandler.js";

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export {
  DEMO_TOKEN,
  DEMO_USER,
  DEMO_RECRUITER_TOKEN,
  DEMO_RECRUITER_USER,
  isGuestUser,
  isRecruiterDemo,
} from "../demo/user.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  const token = header.slice(7);

  if (token === DEMO_RECRUITER_TOKEN) {
    req.user = DEMO_RECRUITER_USER;
    return next();
  }

  if (token === DEMO_TOKEN) {
    req.user = DEMO_USER;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Insufficient permissions"));
    }
    next();
  };
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || isGuestUser(req)) return next();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { profile: true, streak: true },
  });
  if (!user) return next(new AppError(401, "User not found"));
  next();
}
