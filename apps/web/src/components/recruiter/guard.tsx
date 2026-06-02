"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setAuthToken } from "@/lib/api";
import { enterRecruiterDemoMode } from "@/lib/recruiter";
import { Loader2 } from "lucide-react";

export function RecruiterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    async function check() {
      let res = await api<{ role: string }>("/api/users/me");
      if (res.success && res.data) {
        const role = (res.data as { role?: string }).role;
        if (role === "RECRUITER" || role === "ADMIN") {
          setOk(true);
          setBootstrapping(false);
          return;
        }
      }

      const guest = await api<{ token: string }>("/api/auth/guest-recruiter", {
        method: "POST",
      });
      if (guest.success && guest.data?.token) {
        setAuthToken(guest.data.token);
        enterRecruiterDemoMode();
        setOk(true);
        setBootstrapping(false);
        return;
      }

      setBootstrapping(false);
      router.replace("/dashboard");
    }
    void check();
  }, [router]);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ok) return null;

  return <>{children}</>;
}
