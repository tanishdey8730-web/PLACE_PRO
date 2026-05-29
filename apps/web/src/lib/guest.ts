import { setAuthToken } from "./api";

export const DEMO_TOKEN = "placepro-demo-token";

export function isGuestMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("placepro_guest") === "1" ||
    localStorage.getItem("placepro_token") === DEMO_TOKEN
  );
}

export function enterGuestMode(): void {
  setAuthToken(DEMO_TOKEN);
  localStorage.setItem("placepro_guest", "1");
}

export function exitGuestMode(): void {
  localStorage.removeItem("placepro_guest");
  localStorage.removeItem("placepro_token");
}
