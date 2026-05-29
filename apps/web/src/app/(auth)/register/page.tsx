"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { enterGuestMode } from "@/lib/guest";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    enterGuestMode();
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
