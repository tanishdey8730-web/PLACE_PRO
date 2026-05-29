import type { UserRole } from "@placepro/database";
import type { AuthPayload } from "../middleware/auth.js";

export const DEMO_TOKEN = "placepro-demo-token";

export const DEMO_USER: AuthPayload = {
  userId: "demo-guest",
  email: "guest@placepro.ai",
  role: "STUDENT" as UserRole,
};

export function isGuestUser(req: { user?: AuthPayload }): boolean {
  return req.user?.userId === DEMO_USER.userId;
}
