import { setAuthToken } from "./api";

export const RECRUITER_DEMO_TOKEN = "placepro-recruiter-demo-token";

export function enterRecruiterDemoMode(): void {
  setAuthToken(RECRUITER_DEMO_TOKEN);
  if (typeof window !== "undefined") {
    localStorage.setItem("placepro_role", "RECRUITER");
    localStorage.removeItem("placepro_guest");
  }
}

export function isRecruiterDemoToken(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("placepro_token") === RECRUITER_DEMO_TOKEN;
}
