"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [message, setMessage] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    const res = await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    if (res.success) {
      setMessage("If account exists, OTP sent to your email.");
      setStep("reset");
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    const res = await api("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    });
    if (res.success) setMessage("Password reset! You can now log in.");
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" variant="gradient" className="w-full">Send OTP</Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <Input placeholder="6-digit OTP" value={code} onChange={(e) => setCode(e.target.value)} required />
              <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <Button type="submit" variant="gradient" className="w-full">Reset Password</Button>
            </form>
          )}
          {message && <p className="mt-4 text-sm text-emerald-500">{message}</p>}
          <Link href="/login" className="mt-4 block text-center text-sm text-primary">Back to login</Link>
        </CardContent>
      </Card>
    </div>
  );
}
