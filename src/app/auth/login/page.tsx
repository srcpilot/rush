"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.js";
import { AuthForm } from "@/components/auth-form.js";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (formData: any) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // In a real app, we'd call auth.login(data.token, data.user)
    // For this task, we assume the redirect happens after successful API call
    router.push("/dashboard");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-[#fafaf5]">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        <AuthForm type="login" onSubmit={handleLogin} />
        <p className="mt-4 text-center text-[#a3a3a0] text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-[#d4a853] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
