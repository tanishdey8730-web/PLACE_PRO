import { DEMO_TOKEN } from "./guest";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("placepro_token") || DEMO_TOKEN;
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getToken();
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    return await res.json();
  } catch {
    return { success: false, error: "Unable to reach API — using offline demo data" };
  }
}

export function setAuthToken(token: string) {
  localStorage.setItem("placepro_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("placepro_token");
}
