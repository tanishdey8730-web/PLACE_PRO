import jwt from "jsonwebtoken";
import type { UserRole } from "@placepro/database";

export function signToken(payload: { userId: string; email: string; role: UserRole }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
