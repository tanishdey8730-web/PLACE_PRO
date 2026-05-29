"use client";

import { useEffect } from "react";
import { enterGuestMode, isGuestMode } from "@/lib/guest";

/** Ensures dashboard works without login or database. */
export function GuestProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isGuestMode()) {
      enterGuestMode();
    }
  }, []);

  return <>{children}</>;
}
